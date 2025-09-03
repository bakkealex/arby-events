import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().max(200).optional(),
  groupId: z.string(),
});

// GET /api/events - List events
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");
  const upcoming = searchParams.get("upcoming") === "true";
  const subscribed = searchParams.get("subscribed") === "true";

  const where: Record<string, unknown> = {};

  if (groupId) {
    where.groupId = groupId;
  }

  if (upcoming) {
    where.startDate = { gte: new Date() };
  }

  if (subscribed) {
    where.eventSubscriptions = {
      some: { userId: session.user.id },
    };
  }

  const events = await prisma.event.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      startDate: true,
      endDate: true,
      location: true,
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

// POST /api/events - Create event
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createEventSchema.parse(body);

  // Check if user can create events in this group
  const userGroup = await prisma.userGroup.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: parsed.groupId,
      },
    },
  });

  if (
    !userGroup ||
    (userGroup.role !== "ADMIN" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json(
      { error: "Cannot create events in this group" },
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
    },
  });

  return NextResponse.json(
    {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      createdAt: event.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
