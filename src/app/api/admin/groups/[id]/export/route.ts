import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isGroupAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const exportQuerySchema = z.object({
  format: z.enum(["csv", "json", "excel"]).default("csv"),
  includeMembers: z
    .string()
    .transform(val => val === "true")
    .default("true"),
  includeEvents: z
    .string()
    .transform(val => val === "true")
    .default("true"),
  includeSubscriptions: z
    .string()
    .transform(val => val === "true")
    .default("true"),
  dateRange: z.enum(["all", "last30", "last90", "custom"]).default("all"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

function formatCSVValue(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(",");
  const csvRows = data.map(row =>
    headers.map(header => formatCSVValue(row[header])).join(",")
  );
  return [csvHeaders, ...csvRows].join("\n");
}

function getDateFilter(
  dateRange: string,
  startDate?: string | null,
  endDate?: string | null
) {
  const now = new Date();

  switch (dateRange) {
    case "last30":
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { gte: thirtyDaysAgo };
    case "last90":
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { gte: ninetyDaysAgo };
    case "custom":
      if (startDate && endDate) {
        return {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }
      return undefined;
    default:
      return undefined;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: groupId } = await params;
    const { searchParams } = new URL(req.url);

    // Parse and validate query parameters
    let queryParams;
    try {
      queryParams = exportQuerySchema.parse({
        format: searchParams.get("format") || "csv",
        includeMembers: searchParams.get("includeMembers") || "true",
        includeEvents: searchParams.get("includeEvents") || "true",
        includeSubscriptions:
          searchParams.get("includeSubscriptions") || "true",
        dateRange: searchParams.get("dateRange") || "all",
        startDate: searchParams.get("startDate"),
        endDate: searchParams.get("endDate"),
      });
    } catch (err) {
      console.error("Invalid query parameters:", err);
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    // Check permissions - Allow both admins and group admins
    const isUserAdmin = session.user.role === "ADMIN";
    const isUserGroupAdmin = !isUserAdmin
      ? await isGroupAdmin(session.user.id, groupId)
      : true;

    if (!isUserAdmin && !isUserGroupAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const exportData: any = {};
    const dateFilter = getDateFilter(
      queryParams.dateRange,
      queryParams.startDate,
      queryParams.endDate
    );

    // Export members
    if (queryParams.includeMembers) {
      const members = await prisma.userGroup.findMany({
        where: {
          groupId,
          ...(dateFilter && { joinedAt: dateFilter }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
        },
        orderBy: { joinedAt: "desc" },
      });

      exportData.members = members.map(member => ({
        userId: member.user.id,
        name: member.user.name || "No name set",
        email: member.user.email,
        platformRole: member.user.role,
        groupRole: member.role,
        joinedAt: member.joinedAt.toISOString(),
        userCreatedAt: member.user.createdAt.toISOString(),
      }));
    }

    // Export events
    if (queryParams.includeEvents) {
      const events = await prisma.event.findMany({
        where: {
          groupId,
          ...(dateFilter && { startDate: dateFilter }),
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              eventSubscriptions: true,
            },
          },
        },
        orderBy: { startDate: "desc" },
      });

      exportData.events = events.map(event => ({
        eventId: event.id,
        title: event.title,
        description: event.description || "",
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        location: event.location || "",
        creatorId: event.creator?.id || "",
        creatorName: event.creator?.name || "",
        creatorEmail: event.creator?.email || "",
        totalSubscriptions: event._count.eventSubscriptions,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      }));
    }

    // Export event subscriptions
    if (queryParams.includeSubscriptions) {
      const subscriptions = await prisma.eventSubscription.findMany({
        where: {
          event: { groupId },
          ...(dateFilter && { subscribedAt: dateFilter }),
        },
        select: {
          subscribedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
            },
          },
        },
        orderBy: { subscribedAt: "desc" },
      });

      exportData.subscriptions = subscriptions.map(sub => ({
        userId: sub.user.id,
        userName: sub.user.name || "No name set",
        userEmail: sub.user.email,
        eventId: sub.event.id,
        eventTitle: sub.event.title,
        eventStartDate: sub.event.startDate.toISOString(),
        eventEndDate: sub.event.endDate.toISOString(),
        subscribedAt: sub.subscribedAt.toISOString(),
      }));
    }

    // Generate file based on format
    const timestamp = new Date().toISOString().split("T")[0];
    const baseFilename = `${group.name.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_export_${timestamp}`;

    switch (queryParams.format) {
      case "json":
        return NextResponse.json(exportData, {
          headers: {
            "Content-Disposition": `attachment; filename="${baseFilename}.json"`,
          },
        });

      case "csv":
        let csvContent = "";

        if (queryParams.includeMembers && exportData.members?.length > 0) {
          csvContent += "MEMBERS\n";
          const memberHeaders = [
            "userId",
            "name",
            "email",
            "platformRole",
            "groupRole",
            "joinedAt",
            "userCreatedAt",
          ];
          csvContent += generateCSV(exportData.members, memberHeaders) + "\n\n";
        }

        if (queryParams.includeEvents && exportData.events?.length > 0) {
          csvContent += "EVENTS\n";
          const eventHeaders = [
            "eventId",
            "title",
            "description",
            "startDate",
            "endDate",
            "location",
            "creatorName",
            "creatorEmail",
            "totalSubscriptions",
            "createdAt",
          ];
          csvContent += generateCSV(exportData.events, eventHeaders) + "\n\n";
        }

        if (
          queryParams.includeSubscriptions &&
          exportData.subscriptions?.length > 0
        ) {
          csvContent += "EVENT SUBSCRIPTIONS\n";
          const subHeaders = [
            "subscriptionId",
            "userName",
            "userEmail",
            "eventTitle",
            "eventStartDate",
            "eventEndDate",
            "subscribedAt",
          ];
          csvContent +=
            generateCSV(exportData.subscriptions, subHeaders) + "\n\n";
        }

        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${baseFilename}.csv"`,
          },
        });

      case "excel":
        // For Excel, we'll return JSON with Excel-specific content type
        // In a real implementation, you'd use a library like xlsx
        return NextResponse.json(exportData, {
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${baseFilename}.xlsx"`,
          },
        });

      default:
        return NextResponse.json(
          { error: "Unsupported format" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
