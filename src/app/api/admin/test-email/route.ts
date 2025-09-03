import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import {
  sendEmail,
  generateVerificationEmail,
  EmailType,
} from "@/lib/email-enhanced";

// POST /api/admin/test-email - Send test email (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Email address required" },
        { status: 400 }
      );
    }

    const { subject, html, text } = generateVerificationEmail(
      "Test User",
      "test-token-123"
    );

    const emailResult = await sendEmail({
      to,
      subject: `[TEST] ${subject}`,
      html,
      text,
      type: EmailType.SYSTEM_ALERT,
      userId: session.user.id,
      referenceId: `test-email-${Date.now()}`,
    });

    return NextResponse.json({
      success: emailResult,
      message: emailResult
        ? `Test email sent successfully to ${to}`
        : `Failed to send test email to ${to}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
