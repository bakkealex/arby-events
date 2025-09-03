import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import {
  sendEmail,
  generateVerificationEmail,
  EmailType,
} from "@/lib/email-enhanced";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gdprConsent: z
    .boolean()
    .refine(val => val === true, "GDPR consent is required"),
  terms: z
    .boolean()
    .refine(val => val === true, "Terms acceptance is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Email already registered. Please sign in or contact an administrator.",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    // Create user with pending status
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerificationToken,
        accountStatus: "PENDING",
        gdprConsentVersion: "1.0", // Current GDPR version
        gdprConsentDate: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Send email verification email
    try {
      const { subject, html, text } = generateVerificationEmail(
        user.name || "User",
        emailVerificationToken
      );

      const emailResult = await sendEmail({
        to: user.email,
        subject,
        html,
        text,
        type: EmailType.VERIFICATION,
        userId: user.id,
        referenceId: user.id,
      });

      if (emailResult) {
        console.log(`✅ Verification email sent to ${user.email}`);
      } else {
        console.error(`❌ Failed to send verification email to ${user.email}`);
        // Continue with registration even if email fails - user can request resend
      }
    } catch (emailError) {
      console.error("Email sending error during registration:", emailError);
      // Continue with registration even if email fails
    }

    // TODO: Send notification to administrators about new user registration

    return NextResponse.json({
      message:
        "Registration successful! Please check your email to verify your account. An administrator will review your registration.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: "PENDING",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
