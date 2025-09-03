import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // User can export their own data
    const authSession = await requireRole(UserRole.USER);

    // Fetch all user data
    const userData = await prisma.user.findUnique({
      where: { id: authSession.userId },
      include: {
        userGroups: {
          include: {
            group: {
              select: { id: true, name: true, description: true },
            },
          },
        },
        eventSubscriptions: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                location: true,
              },
            },
          },
        },
        createdEvents: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            location: true,
            createdAt: true,
          },
        },
        createdGroups: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
          },
        },
        sentNotifications: {
          select: {
            id: true,
            subject: true,
            message: true,
            createdAt: true,
            sentAt: true,
          },
        },
        receivedNotifications: {
          select: {
            id: true,
            subject: true,
            message: true,
            createdAt: true,
            sentAt: true,
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive fields and create safe export data
    const safeExportData = { ...userData };
    delete (safeExportData as Record<string, unknown>).password;
    delete (safeExportData as Record<string, unknown>).emailVerificationToken;

    // Create a comprehensive data export
    const dataExport = {
      exportedAt: new Date().toISOString(),
      user: {
        ...safeExportData,
        createdAt: (safeExportData.createdAt as Date)?.toISOString(),
        updatedAt: (safeExportData.updatedAt as Date)?.toISOString(),
      },
      summary: {
        totalGroups: userData.userGroups.length,
        totalEventSubscriptions: userData.eventSubscriptions.length,
        totalCreatedEvents: userData.createdEvents.length,
        totalCreatedGroups: userData.createdGroups.length,
        totalSentNotifications: userData.sentNotifications.length,
        totalReceivedNotifications: userData.receivedNotifications.length,
      },
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(dataExport, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="user-data-export-${authSession.userId}-${new Date().toISOString().split("T")[0]}.json"`,
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

    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
