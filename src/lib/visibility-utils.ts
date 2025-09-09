import { UserRole, GroupRole } from "@prisma/client";
import { prisma } from "./prisma";

export interface VisibilityContext {
  userId?: string;
  userRole?: UserRole;
  isAuthenticated: boolean;
}

/**
 * Get visibility filter for groups based on user permissions
 * - Hidden groups are visible to: group admins, site admins
 * - Visible groups are visible to: all authenticated users
 */
export function getGroupVisibilityFilter(context: VisibilityContext) {
  if (!context.isAuthenticated) {
    // No groups visible to unauthenticated users
    return { visible: true, id: "impossible" };
  }

  if (context.userRole === UserRole.ADMIN) {
    // Site admins can see all groups
    return {};
  }

  if (!context.userId) {
    // Only visible groups for users without ID
    return { visible: true };
  }

  // For regular users: visible groups OR groups where they are admin
  return {
    OR: [
      { visible: true },
      {
        visible: false,
        userGroups: {
          some: {
            userId: context.userId,
            role: GroupRole.ADMIN,
          },
        },
      },
    ],
  };
}

/**
 * Get visibility filter for events based on user permissions
 * - Hidden events are visible to: attendees, group admins, site admins
 * - Visible events are visible to: all authenticated users
 */
export function getEventVisibilityFilter(context: VisibilityContext) {
  if (!context.isAuthenticated) {
    // No events visible to unauthenticated users (unless you want public events)
    return { visible: true, id: "impossible" };
  }

  if (context.userRole === UserRole.ADMIN) {
    // Site admins can see all events
    return {};
  }

  if (!context.userId) {
    // Only visible events for users without ID
    return { visible: true };
  }

  // For regular users: visible events OR events where they are:
  // - subscribed (attendee)
  // - group admin of the event's group
  return {
    OR: [
      { visible: true },
      {
        visible: false,
        eventSubscriptions: {
          some: {
            userId: context.userId,
          },
        },
      },
      {
        visible: false,
        group: {
          userGroups: {
            some: {
              userId: context.userId,
              role: GroupRole.ADMIN,
            },
          },
        },
      },
    ],
  };
}

/**
 * Check if a user can see a specific group
 */
export async function canUserSeeGroup(
  groupId: string,
  context: VisibilityContext
): Promise<boolean> {
  if (context.userRole === UserRole.ADMIN) {
    return true;
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      visible: true,
      userGroups: context.userId
        ? {
            where: {
              userId: context.userId,
              role: GroupRole.ADMIN,
            },
            select: { role: true },
          }
        : false,
    },
  });

  if (!group) {
    return false;
  }

  // If group is visible, user can see it (if authenticated)
  if (group.visible && context.isAuthenticated) {
    return true;
  }

  // If group is hidden, only group admins can see it
  if (
    !group.visible &&
    context.userId &&
    group.userGroups &&
    group.userGroups.length > 0
  ) {
    return true;
  }

  return false;
}

/**
 * Check if a user can see a specific event
 */
export async function canUserSeeEvent(
  eventId: string,
  context: VisibilityContext
): Promise<boolean> {
  if (context.userRole === UserRole.ADMIN) {
    return true;
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      visible: true,
      eventSubscriptions: context.userId
        ? {
            where: { userId: context.userId },
            select: { userId: true },
          }
        : false,
      group: {
        select: {
          userGroups: context.userId
            ? {
                where: {
                  userId: context.userId,
                  role: GroupRole.ADMIN,
                },
                select: { role: true },
              }
            : false,
        },
      },
    },
  });

  if (!event) {
    return false;
  }

  // If event is visible, user can see it (if authenticated)
  if (event.visible && context.isAuthenticated) {
    return true;
  }

  // If event is hidden, check if user is attendee or group admin
  if (!event.visible && context.userId) {
    // User is subscribed to the event
    if (event.eventSubscriptions && event.eventSubscriptions.length > 0) {
      return true;
    }

    // User is group admin of the event's group
    if (event.group.userGroups && event.group.userGroups.length > 0) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a user can modify visibility of a group
 */
export async function canUserModifyGroupVisibility(
  groupId: string,
  context: VisibilityContext
): Promise<boolean> {
  if (context.userRole === UserRole.ADMIN) {
    return true;
  }

  if (!context.userId) {
    return false;
  }

  const membership = await prisma.userGroup.findUnique({
    where: {
      userId_groupId: {
        userId: context.userId,
        groupId: groupId,
      },
    },
    select: { role: true },
  });

  return membership?.role === GroupRole.ADMIN;
}

/**
 * Check if a user can modify visibility of an event
 */
export async function canUserModifyEventVisibility(
  eventId: string,
  context: VisibilityContext
): Promise<boolean> {
  if (context.userRole === UserRole.ADMIN) {
    return true;
  }

  if (!context.userId) {
    return false;
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      createdBy: true,
      group: {
        select: {
          userGroups: {
            where: {
              userId: context.userId,
              role: GroupRole.ADMIN,
            },
            select: { role: true },
          },
        },
      },
    },
  });

  if (!event) {
    return false;
  }

  // Event creator can modify visibility
  if (event.createdBy === context.userId) {
    return true;
  }

  // Group admin can modify event visibility
  return event.group.userGroups.length > 0;
}
