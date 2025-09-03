import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const updateEventSchema = z
  .object({
    title: z
      .string()
      .min(2, "Title must be at least 2 characters")
      .max(100, "Title too long")
      .optional(),
    description: z.string().max(500, "Description too long").optional(),
    startDate: z
      .preprocess(
        val => (val ? new Date(val as string) : undefined),
        z.date({
          errorMap: () => ({ message: "Valid start date is required" }),
        })
      )
      .optional(),
    endDate: z
      .preprocess(
        val => (val ? new Date(val as string) : undefined),
        z.date({
          errorMap: () => ({ message: "Valid end date is required" }),
        })
      )
      .optional(),
    location: z.string().max(100, "Location too long").optional(),
    groupId: z.string().min(1, "Group ID is required").optional(),
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        return data.startDate < data.endDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

// GET /api/admin/events/[id] - Get event details (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate event ID
    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Require admin role
    await requireRole(UserRole.ADMIN);

    // Get event with all related data
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        groupId: true,
        createdBy: true,
        group: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
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
        eventSubscriptions: {
          select: {
            userId: true,
            subscribedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                active: true,
              },
            },
          },
          orderBy: {
            subscribedAt: "desc",
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      group: event.group,
      creator: event.creator,
      subscriberCount: event._count.eventSubscriptions,
      subscribers: event.eventSubscriptions.map(sub => ({
        id: sub.user.id,
        name: sub.user.name,
        email: sub.user.email,
        active: sub.user.active,
        subscribedAt: sub.subscribedAt,
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Authentication required") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      if (error.message === "Account is deactivated") {
        return NextResponse.json(
          { error: "Account is deactivated" },
          { status: 403 }
        );
      }
      if (error.message.includes("Insufficient permissions")) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/events/[id] - Update event (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate event ID
    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    // Check if there's actually something to update
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // Require admin role
    const session = await requireRole(UserRole.ADMIN);

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        groupId: true,
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // If group is being changed, validate new group exists
    if (
      validatedData.groupId &&
      validatedData.groupId !== existingEvent.groupId
    ) {
      const newGroup = await prisma.group.findUnique({
        where: { id: validatedData.groupId },
        select: { id: true, name: true },
      });

      if (!newGroup) {
        return NextResponse.json(
          { error: "Target group not found" },
          { status: 404 }
        );
      }
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        groupId: true,
        createdBy: true,
        group: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
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
    });

    return NextResponse.json({
      message: "Event updated successfully",
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description,
        startDate: updatedEvent.startDate,
        endDate: updatedEvent.endDate,
        location: updatedEvent.location,
        createdAt: updatedEvent.createdAt,
        updatedAt: updatedEvent.updatedAt,
        group: updatedEvent.group,
        creator: updatedEvent.creator,
        subscriberCount: updatedEvent._count.eventSubscriptions,
      },
      updatedBy: {
        id: session.userId,
        email: session.email,
        name: session.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === "Authentication required") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      if (error.message === "Account is deactivated") {
        return NextResponse.json(
          { error: "Account is deactivated" },
          { status: 403 }
        );
      }
      if (error.message.includes("Insufficient permissions")) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events/[id] - Delete event (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate event ID
    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Require admin role
    const session = await requireRole(UserRole.ADMIN);

    // Check if event exists and get details for response
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        groupId: true,
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            eventSubscriptions: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Use transaction to safely delete event and all related data
    await prisma.$transaction(async tx => {
      // Delete all event subscriptions first
      await tx.eventSubscription.deleteMany({
        where: { eventId: id },
      });

      // Delete the event
      await tx.event.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: "Event deleted successfully",
      deletedEvent: {
        id: existingEvent.id,
        title: existingEvent.title,
        startDate: existingEvent.startDate,
        endDate: existingEvent.endDate,
        group: existingEvent.group,
        subscriberCount: existingEvent._count.eventSubscriptions,
      },
      deletedBy: {
        id: session.userId,
        email: session.email,
        name: session.name,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Authentication required") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      if (error.message === "Account is deactivated") {
        return NextResponse.json(
          { error: "Account is deactivated" },
          { status: 403 }
        );
      }
      if (error.message.includes("Insufficient permissions")) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
