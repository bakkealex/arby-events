import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getEventVisibilityFilter,
  getGroupVisibilityFilter,
} from "@/lib/visibility-utils";
import { UserRole } from "@/types";

// User-facing API endpoint - Users can subscribe to events they have access to
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Create visibility context
    const visibilityContext = {
      userId: session.user.id,
      userRole: session.user.role as UserRole,
      isAuthenticated: true,
    };

    // Get visibility filters
    const eventFilter = getEventVisibilityFilter(visibilityContext);
    const groupFilter = getGroupVisibilityFilter(visibilityContext);

    // Check if event exists and user has access to it
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        ...eventFilter,
        group: groupFilter,
      },
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
      return NextResponse.json(
        { error: "Event not found or you don't have access to it" },
        { status: 404 }
      );
    }

    // Check if user is member of the group
    if (event.group.userGroups.length === 0) {
      return NextResponse.json(
        { error: "Must be group member to subscribe to events" },
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
      return NextResponse.json(
        { error: "Already subscribed to this event" },
        { status: 400 }
      );
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
  } catch (error) {
    console.error("Error subscribing to event:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to event" },
      { status: 500 }
    );
  }
}

// User-facing API endpoint - Users can unsubscribe from events
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Check if subscription exists
    const subscription = await prisma.eventSubscription.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "You are not subscribed to this event" },
        { status: 404 }
      );
    }

    // Remove subscription
    await prisma.eventSubscription.delete({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    });

    return NextResponse.json({
      message: `Successfully unsubscribed from event "${subscription.event.title}"`,
    });
  } catch (error) {
    console.error("Error unsubscribing from event:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe from event" },
      { status: 500 }
    );
  }
}
