import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  sendEmail,
  generateApprovalEmail,
  EmailType,
} from "@/lib/email-enhanced";

const approveUserSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin role
    const authSession = await requireRole(UserRole.ADMIN);

    const body = await request.json();
    const { action } = approveUserSchema.parse(body);

    const { id: userId } = await params;

    // Check if user exists and get current status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        accountStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const accountStatus = action === "approve" ? "APPROVED" : "SUSPENDED";

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus,
        approvedBy: authSession.userId,
        approvedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        accountStatus: true,
        approvedAt: true,
      },
    });

    // Send email notification to user about approval/rejection
    if (action === "approve") {
      try {
        const { subject, html, text } = generateApprovalEmail(
          updatedUser.name || "User",
          "Arby Events"
        );

        const emailResult = await sendEmail({
          to: updatedUser.email,
          subject,
          html,
          text,
          type: EmailType.ACCOUNT_APPROVED,
          userId: updatedUser.id,
          referenceId: authSession.userId,
        });

        if (emailResult) {
          console.log(`✅ Approval email sent to ${updatedUser.email}`);
        } else {
          console.error(
            `❌ Failed to send approval email to ${updatedUser.email}`
          );
        }
      } catch (emailError) {
        console.error("Email sending error during approval:", emailError);
        // Continue with approval even if email fails
      }
    }

    return NextResponse.json({
      message: `User ${action}d successfully`,
      user: {
        ...updatedUser,
        accountStatus: accountStatus,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    if (
      errorMessage === "Authentication required" ||
      errorMessage.includes("role")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.error("User approval error:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
