import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateICSFile, CalendarEvent } from "@/lib/calendar";
import {
  getEventVisibilityFilter,
  getGroupVisibilityFilter,
} from "@/lib/visibility-utils";
import { UserRole } from "@/types";

// User-facing API endpoint - Generate calendar (.ics) files for events user has access to
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const groupId = searchParams.get("groupId");

    // Create visibility context
    const visibilityContext = {
      userId: session.user.id,
      userRole: session.user.role as UserRole,
      isAuthenticated: true,
    };

    // Get visibility filters
    const eventFilter = getEventVisibilityFilter(visibilityContext);
    const groupFilter = getGroupVisibilityFilter(visibilityContext);

    let events;

    if (eventId) {
      // Get single event with visibility checks
      const event = await prisma.event.findFirst({
        where: {
          id: eventId,
          ...eventFilter,
          group: {
            ...groupFilter,
            userGroups: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
        include: {
          group: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      events = [event];
    } else if (groupId) {
      // Get all events from a specific group with visibility checks
      events = await prisma.event.findMany({
        where: {
          groupId: groupId,
          ...eventFilter,
          group: {
            ...groupFilter,
            userGroups: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
        include: {
          group: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          startDate: "asc",
        },
      });
    } else {
      // Get all events from user's subscribed events with visibility checks
      events = await prisma.event.findMany({
        where: {
          ...eventFilter,
          eventSubscriptions: {
            some: {
              userId: session.user.id,
            },
          },
        },
        include: {
          group: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          startDate: "asc",
        },
      });
    }

    // Convert to calendar events
    const calendarEvents: CalendarEvent[] = events.map(
      (event: {
        id: string;
        title: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        location: string | null;
      }) => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location || "",
      })
    );

    // Generate ICS file
    const icsContent = generateICSFile(calendarEvents);

    if (!icsContent) {
      return NextResponse.json(
        { error: "Failed to generate calendar file" },
        { status: 500 }
      );
    }

    // Determine filename
    let filename = "events.ics";
    if (eventId && events.length === 1) {
      filename = `${events[0].title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
    } else if (groupId && events.length > 0) {
      filename = `${events[0].group.name.replace(/[^a-zA-Z0-9]/g, "_")}_events.ics`;
    }

    // Return ICS file
    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Calendar download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
