import { prisma } from "@/lib/prisma";

/**
 * Cleanup task to delete accounts that have been pending for more than 1 year
 * This should be run as a scheduled task (e.g., daily via cron job)
 */
export async function cleanupPendingAccounts() {
  try {
    // Calculate date 1 year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Find accounts that are pending and older than 1 year
    const accountsToDelete = await prisma.user.findMany({
      where: {
        accountStatus: "PENDING",
        createdAt: {
          lt: oneYearAgo,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (accountsToDelete.length === 0) {
      console.log("No pending accounts to cleanup");
      return { deleted: 0, accounts: [] };
    }

    // Log accounts that will be deleted
    console.log(
      `Found ${accountsToDelete.length} pending accounts older than 1 year:`
    );
    accountsToDelete.forEach(account => {
      console.log(
        `- ${account.email} (${account.name}) - Created: ${account.createdAt.toISOString()}`
      );
    });

    // Delete the accounts
    const deletedAccounts = await prisma.user.deleteMany({
      where: {
        id: {
          in: accountsToDelete.map(account => account.id),
        },
      },
    });

    console.log(
      `Successfully deleted ${deletedAccounts.count} pending accounts`
    );

    return {
      deleted: deletedAccounts.count,
      accounts: accountsToDelete,
    };
  } catch (error) {
    console.error("Error cleaning up pending accounts:", error);
    throw error;
  }
}

/**
 * Check for accounts approaching the 1-year limit (within 30 days)
 * This can be used to send reminder emails to administrators
 */
export async function getAccountsApproachingLimit() {
  try {
    // Calculate dates
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const elevenMonthsAgo = new Date();
    elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

    // Find accounts that are pending and between 11-12 months old
    const accountsApproachingLimit = await prisma.user.findMany({
      where: {
        accountStatus: "PENDING",
        createdAt: {
          lt: elevenMonthsAgo,
          gte: oneYearAgo,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return accountsApproachingLimit;
  } catch (error) {
    console.error("Error checking accounts approaching limit:", error);
    throw error;
  }
}

/**
 * Manual cleanup function for testing
 * Can be called from an API endpoint for manual execution
 */
export async function runManualCleanup() {
  console.log("Starting manual cleanup of pending accounts...");
  const result = await cleanupPendingAccounts();

  const approaching = await getAccountsApproachingLimit();
  if (approaching.length > 0) {
    console.log(`\nAccounts approaching 1-year limit (${approaching.length}):`);
    approaching.forEach(account => {
      const daysUntilDeletion = Math.ceil(
        (new Date().getTime() - account.createdAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      console.log(
        `- ${account.email} - ${daysUntilDeletion} days until deletion`
      );
    });
  }

  return {
    cleanup: result,
    approaching: approaching,
  };
}
