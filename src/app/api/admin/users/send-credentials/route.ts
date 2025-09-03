import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

const sendCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireRole(UserRole.ADMIN);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, password, name } = sendCredentialsSchema.parse(body);

    // Send email with credentials
    await sendEmail({
      to: email,
      subject: "Welcome to Arby Events - Your Account Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Arby Events!</h2>
          
          <p>Hello ${name || "there"},</p>
          
          <p>An administrator has created an account for you on Arby Events. Here are your login credentials:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
          </div>
          
          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
          
          <p>You can log in at: <a href="${process.env.NEXTAUTH_URL}/auth/signin" style="color: #2563eb;">${process.env.NEXTAUTH_URL}/auth/signin</a></p>
          
          <p>If you have any questions, please contact your administrator.</p>
          
          <p>Best regards,<br>Arby Events Team</p>
        </div>
      `,
      text: `
Welcome to Arby Events!

Hello ${name || "there"},

An administrator has created an account for you on Arby Events. Here are your login credentials:

Email: ${email}
Temporary Password: ${password}

Important: Please change your password after your first login for security purposes.

You can log in at: ${process.env.NEXTAUTH_URL}/auth/signin

If you have any questions, please contact your administrator.

Best regards,
Arby Events Team
      `,
    });

    return NextResponse.json({
      message: "Credentials sent successfully",
      sentTo: email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error sending credentials:", error);
    return NextResponse.json(
      { error: "Failed to send credentials" },
      { status: 500 }
    );
  }
}
