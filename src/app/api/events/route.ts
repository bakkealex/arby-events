import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import {
  getEventVisibilityFilter,
  type VisibilityContext,
} from "@/lib/visibility-utils";

const createEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().max(200).optional(),
  groupId: z.string(),
  visible: z.boolean().optional().default(true),
});

// GET /api/events - List events for authenticated users
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");
  const upcoming = searchParams.get("upcoming") === "true";
  const subscribed = searchParams.get("subscribed") === "true";

  // Get user context for visibility filtering
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const visibilityContext: VisibilityContext = {
    userId: session.user.id,
    userRole: user.role,
    isAuthenticated: true,
  };

  // Build where clause with visibility filtering
  const conditions: Array<Record<string, unknown>> = [];

  // Add visibility filter
  const visibilityFilter = getEventVisibilityFilter(visibilityContext);
  conditions.push(visibilityFilter);

  // Add additional filters
  if (groupId) {
    conditions.push({ groupId });
  }

  if (upcoming) {
    conditions.push({ startDate: { gte: new Date() } });
  }

  if (subscribed) {
    conditions.push({
      eventSubscriptions: {
        some: { userId: session.user.id },
      },
    });
  }

  // Combine all conditions
  const where =
    conditions.length > 1 ? { AND: conditions } : conditions[0] || {};

  const events = await prisma.event.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      startDate: true,
      endDate: true,
      location: true,
      visible: true,
      group: { select: { id: true, name: true } },
      creator: { select: { name: true, email: true } },
      _count: { select: { eventSubscriptions: true } },
      eventSubscriptions: subscribed
        ? {
            where: { userId: session.user.id },
            select: { subscribedAt: true },
          }
        : false,
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({
    events: events.map(event => ({
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      isSubscribed: subscribed
        ? event.eventSubscriptions.length > 0
        : undefined,
      eventSubscriptions: undefined,
    })),
  });
}

// POST /api/events - Create event (Group Admins and Site Admins)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createEventSchema.parse(body);

    // Check if user can create events in this group
    // Group admins and site admins can create events
    const userGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: parsed.groupId,
        },
      },
    });

    const canCreateEvent =
      session.user.role === UserRole.ADMIN || // Site admin
      (userGroup && userGroup.role === "ADMIN"); // Group admin

    if (!canCreateEvent) {
      return NextResponse.json(
        {
          error:
            "Access denied. You must be a group administrator or site administrator to create events.",
        },
        { status: 403 }
      );
    }

    const event = await prisma.event.create({
      data: {
        ...parsed,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        createdBy: session.user.id,
      },
      include: {
        group: { select: { name: true } },
        creator: { select: { name: true } },
        _count: { select: { eventSubscriptions: true } },
      },
    });

    return NextResponse.json(
      {
        ...event,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
