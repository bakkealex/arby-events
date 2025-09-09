import { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            active: true,
            role: true,
            accountStatus: true,
            emailVerified: true,
          },
        });

        if (!user) {
          return null;
        }

        // Check if user is active
        if (!user.active) {
          throw new Error("Account is inactive");
        }

        // Check email verification
        if (!user.emailVerified) {
          throw new Error("Please verify your email address before logging in");
        }

        // Check account approval status
        if (user.accountStatus !== "APPROVED") {
          if (user.accountStatus === "PENDING") {
            throw new Error("Account pending administrator approval");
          } else if (user.accountStatus === "SUSPENDED") {
            throw new Error("Account has been suspended");
          } else {
            throw new Error("Account access denied");
          }
        }

        // For OAuth users, password might not exist
        if (!user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          active: user.active,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // ensure token carries basic user info on sign-in
      if (user) {
        token.id = (user as any).id ?? token.id;
        token.name = (user as any).name ?? token.name;
        token.email = (user as any).email ?? token.email;
        token.role = (user as any).role ?? token.role;
        token.active = (user as any).active ?? token.active;
      }

      // Handle client-side session.update() calls: copy only expected fields
      if (trigger === "update" && session?.user) {
        const sUser = session.user as Partial<typeof session.user>;
        if (typeof sUser.name === "string") token.name = sUser.name;
        if (typeof sUser.email === "string") token.email = sUser.email;
        if (typeof sUser.role !== "undefined") token.role = sUser.role as any;
        if (typeof sUser.active === "boolean")
          token.active = sUser.active as any;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.role = (token.role as UserRole) ?? session.user.role;
        session.user.active = (token.active as boolean) ?? session.user.active;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure user gets created with default values
      if (account?.provider !== "credentials") {
        try {
          // Check if user exists, if not create with default role
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                role: UserRole.USER,
                active: true,
              },
            });
          }
        } catch (error) {
          console.error("Error creating OAuth user:", error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
