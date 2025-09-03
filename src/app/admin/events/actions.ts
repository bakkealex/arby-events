"use server";

import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface EventFilters {
  time?: "upcoming" | "past" | "all";
  groups?: string[];
  search?: string;
  sort?:
    | "date-desc"
    | "date-asc"
    | "title-asc"
    | "title-desc"
    | "subscribers-desc";
  page?: number;
  limit?: number;
}

export async function getEvents(filters: EventFilters = {}) {
  await requireRole(UserRole.ADMIN);

  const {
    time = "upcoming",
    groups = [],
    search = "",
    sort = "date-desc",
    page = 1,
    limit = 50,
  } = filters;

  const now = new Date();

  // Build where clause
  const where: Record<string, unknown> = {};

  // Time filter
  if (time === "upcoming") {
    where.startDate = { gte: now };
  } else if (time === "past") {
    where.startDate = { lt: now };
  }
  // 'all' doesn't add a time filter

  // Groups filter
  if (groups.length > 0) {
    where.groupId = { in: groups };
  }

  // Search filter
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  // Build orderBy clause
  let orderBy: Record<string, unknown> = {};
  switch (sort) {
    case "date-asc":
      orderBy = { startDate: "asc" };
      break;
    case "date-desc":
      orderBy = { startDate: "desc" };
      break;
    case "title-asc":
      orderBy = { title: "asc" };
      break;
    case "title-desc":
      orderBy = { title: "desc" };
      break;
    case "subscribers-desc":
      orderBy = { eventSubscriptions: { _count: "desc" } };
      break;
    default:
      orderBy = { startDate: "desc" };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        createdAt: true,
        updatedAt: true,
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
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getEventCounts() {
  await requireRole(UserRole.ADMIN);

  const now = new Date();

  const [upcoming, past, all] = await Promise.all([
    prisma.event.count({ where: { startDate: { gte: now } } }),
    prisma.event.count({ where: { startDate: { lt: now } } }),
    prisma.event.count(),
  ]);

  return { upcoming, past, all };
}

export async function getEvent(id: string) {
  await requireRole(UserRole.ADMIN);

  return await prisma.event.findUnique({
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
}

export async function createEvent(data: {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  groupId: string;
}) {
  const session = await requireRole(UserRole.ADMIN);

  const event = await prisma.event.create({
    data: {
      ...data,
      createdBy: session.userId,
    },
  });

  revalidatePath("/admin/events");
  return event;
}

export async function updateEvent(
  id: string,
  data: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    groupId?: string;
  }
) {
  await requireRole(UserRole.ADMIN);

  const event = await prisma.event.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  return event;
}

export async function deleteEvent(id: string) {
  await requireRole(UserRole.ADMIN);

  // Delete all event subscriptions first
  await prisma.eventSubscription.deleteMany({
    where: { eventId: id },
  });

  // Delete the event
  await prisma.event.delete({
    where: { id },
  });

  revalidatePath("/admin/events");
  return { success: true };
}

export async function getEventStats() {
  await requireRole(UserRole.ADMIN);

  const [totalEvents, upcomingEvents, pastEvents, totalSubscriptions] =
    await Promise.all([
      prisma.event.count(),
      prisma.event.count({
        where: {
          startDate: {
            gte: new Date(),
          },
        },
      }),
      prisma.event.count({
        where: {
          endDate: {
            lt: new Date(),
          },
        },
      }),
      prisma.eventSubscription.count(),
    ]);

  return {
    totalEvents,
    upcomingEvents,
    pastEvents,
    totalSubscriptions,
  };
}

export async function getGroups() {
  await requireRole(UserRole.ADMIN);

  return await prisma.group.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
