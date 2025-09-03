import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import {
  cleanupPendingAccounts,
  getAccountsApproachingLimit,
} from "@/lib/account-cleanup";

// POST /api/admin/cleanup-accounts - Manual cleanup of pending accounts (Admin only)
export async function POST() {
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

    const result = await cleanupPendingAccounts();
    const approaching = await getAccountsApproachingLimit();

    return NextResponse.json({
      message: "Account cleanup completed successfully",
      deleted: result.deleted,
      deletedAccounts: result.accounts,
      accountsApproachingLimit: approaching,
      summary: {
        totalDeleted: result.deleted,
        approachingLimit: approaching.length,
      },
    });
  } catch (error) {
    console.error("Account cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup accounts" },
      { status: 500 }
    );
  }
}

// GET /api/admin/cleanup-accounts - Check accounts approaching limit (Admin only)
export async function GET() {
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

    const approaching = await getAccountsApproachingLimit();

    // Calculate days until deletion for each account
    const accountsWithDays = approaching.map(account => {
      const oneYearFromCreation = new Date(account.createdAt);
      oneYearFromCreation.setFullYear(oneYearFromCreation.getFullYear() + 1);

      const daysUntilDeletion = Math.ceil(
        (oneYearFromCreation.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      return {
        ...account,
        daysUntilDeletion,
        deletionDate: oneYearFromCreation.toISOString(),
      };
    });

    return NextResponse.json({
      accountsApproachingLimit: accountsWithDays,
      count: accountsWithDays.length,
      summary: `${accountsWithDays.length} accounts will be automatically deleted within 30 days if not approved`,
    });
  } catch (error) {
    console.error("Error checking accounts approaching limit:", error);
    return NextResponse.json(
      { error: "Failed to check accounts" },
      { status: 500 }
    );
  }
}
