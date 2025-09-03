import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const createEventSchema = z
  .object({
    title: z
      .string()
      .min(2, "Title must be at least 2 characters")
      .max(100, "Title too long"),
    description: z.string().max(500, "Description too long").optional(),
    startDate: z.preprocess(
      val => (val ? new Date(val as string) : undefined),
      z.date({
        errorMap: () => ({ message: "Valid start date is required" }),
      })
    ),
    endDate: z.preprocess(
      val => (val ? new Date(val as string) : undefined),
      z.date({
        errorMap: () => ({ message: "Valid end date is required" }),
      })
    ),
    location: z.string().max(100, "Location too long").optional(),
    groupId: z.string().min(1, "Group ID is required"),
  })
  .refine(data => data.startDate < data.endDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

const listEventsSchema = z.object({
  groupId: z.string().optional(),
  page: z.preprocess(
    val => (val ? parseInt(val as string) : 1),
    z.number().min(1)
  ),
  limit: z.preprocess(
    val => (val ? parseInt(val as string) : 20),
    z.number().min(1).max(100)
  ),
  search: z.string().optional(),
});

// GET /api/admin/events - List all events (admin view)
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    await requireRole(UserRole.ADMIN);

    const { searchParams } = new URL(request.url);
    const queryParams = {
      groupId: searchParams.get("groupId") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      search: searchParams.get("search") || undefined,
    };

    const validatedParams = listEventsSchema.parse(queryParams);

    // Build where clause
    const whereClause: Record<string, unknown> = {};

    if (validatedParams.groupId) {
      whereClause.groupId = validatedParams.groupId;
    }

    if (validatedParams.search) {
      whereClause.OR = [
        { title: { contains: validatedParams.search, mode: "insensitive" } },
        {
          description: {
            contains: validatedParams.search,
            mode: "insensitive",
          },
        },
        { location: { contains: validatedParams.search, mode: "insensitive" } },
      ];
    }

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    // Get events with related data
    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
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
        orderBy: { startDate: "desc" },
        skip,
        take: validatedParams.limit,
      }),
      prisma.event.count({ where: whereClause }),
    ]);

    // Transform response
    const formattedEvents = events.map(event => ({
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
    }));

    return NextResponse.json({
      events: formattedEvents,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / validatedParams.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
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

    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/events - Create event (admin)
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    // Require admin role
    const session = await requireRole(UserRole.ADMIN);

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: validatedData.groupId },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        location: validatedData.location,
        groupId: validatedData.groupId,
        createdBy: session.userId,
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

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: {
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
        },
        createdBy: {
          id: session.userId,
          email: session.email,
          name: session.name,
        },
      },
      { status: 201 }
    );
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

    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
