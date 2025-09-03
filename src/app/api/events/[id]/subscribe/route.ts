import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;

  // Check if event exists and user is member of the group
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      group: {
        include: {
          userGroups: {
            where: { userId: session.user.id },
          },
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.group.userGroups.length === 0) {
    return NextResponse.json(
      { error: "Must be group member to subscribe" },
      { status: 403 }
    );
  }

  // Check if already subscribed
  const existingSubscription = await prisma.eventSubscription.findUnique({
    where: {
      userId_eventId: {
        userId: session.user.id,
        eventId,
      },
    },
  });

  if (existingSubscription) {
    return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
  }

  // Create subscription
  const subscription = await prisma.eventSubscription.create({
    data: {
      userId: session.user.id,
      eventId,
      subscribedAt: new Date(),
    },
  });

  return NextResponse.json({
    message: "Successfully subscribed to event",
    subscription: {
      ...subscription,
      subscribedAt: subscription.subscribedAt.toISOString(),
    },
  });
}
