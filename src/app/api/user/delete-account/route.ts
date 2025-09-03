import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const deleteAccountSchema = z.object({
  confirmEmail: z.string().email("Valid email required for confirmation"),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // User can delete their own account
    const authSession = await requireRole(UserRole.USER);

    const body = await request.json();
    const { confirmEmail, reason } = deleteAccountSchema.parse(body);

    // Verify the email matches the user's email
    if (confirmEmail !== authSession.email) {
      return NextResponse.json(
        {
          error: "Email confirmation does not match your account email",
        },
        { status: 400 }
      );
    }

    // Start a transaction to delete all user data
    const deletionResult = await prisma.$transaction(async tx => {
      // Delete user's event subscriptions
      await tx.eventSubscription.deleteMany({
        where: { userId: authSession.userId },
      });

      // Delete user's group memberships
      await tx.userGroup.deleteMany({
        where: { userId: authSession.userId },
      });

      // Delete user's sent notifications
      await tx.notification.deleteMany({
        where: { senderId: authSession.userId },
      });

      // Update received notifications to remove recipient reference
      await tx.notification.updateMany({
        where: { recipientId: authSession.userId },
        data: { recipientId: null },
      });

      // Note: We might want to keep events and groups created by the user
      // but transfer ownership or mark them as orphaned
      // For now, we'll update them to be owned by a system admin

      // Transfer created events to first admin (if any)
      const firstAdmin = await tx.user.findFirst({
        where: { role: UserRole.ADMIN },
        select: { id: true },
      });

      if (firstAdmin) {
        await tx.event.updateMany({
          where: { createdBy: authSession.userId },
          data: { createdBy: firstAdmin.id },
        });

        await tx.group.updateMany({
          where: { createdBy: authSession.userId },
          data: { createdBy: firstAdmin.id },
        });
      }

      // Finally, delete the user account
      const deletedUser = await tx.user.delete({
        where: { id: authSession.userId },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      return deletedUser;
    });

    // Log the deletion (could be to a separate audit log)
    console.log(
      `User account deleted: ${deletionResult.email} (${deletionResult.id}) - Reason: ${reason || "Not provided"}`
    );

    return NextResponse.json({
      message:
        "Account successfully deleted. All personal data has been removed in compliance with GDPR.",
      deletedUser: {
        id: deletionResult.id,
        email: deletionResult.email,
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    if (
      error.message === "Authentication required" ||
      error.message.includes("role")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
