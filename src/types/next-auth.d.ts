import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: UserRole;
      active?: boolean;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role?: UserRole;
    active?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole;
    active?: boolean;
  }
}
import { UserRole } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      active: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    active: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    active: boolean;
  }
}
