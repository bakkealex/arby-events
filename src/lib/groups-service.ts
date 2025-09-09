import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import {
  getGroupVisibilityFilter,
  type VisibilityContext,
} from "@/lib/visibility-utils";

export interface GroupListOptions {
  search?: string;
  page?: number;
  limit?: number;
  includeHidden?: boolean; // For admin views
}

export interface GroupListResult {
  groups: Array<{
    id: string;
    name: string;
    description: string | null;
    visible: boolean;
    createdAt: string;
    createdBy: string;
    creator: {
      name: string | null;
      email: string;
    };
    _count: {
      userGroups: number;
      events: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Shared function to fetch groups with proper visibility filtering
 */
export async function getGroupsList(
  visibilityContext: VisibilityContext,
  options: GroupListOptions = {}
): Promise<GroupListResult> {
  const { search, page = 1, limit = 10, includeHidden = false } = options;

  const skip = (page - 1) * limit;

  // Build where clause step by step
  const conditions: Array<Record<string, unknown>> = [];

  // Step 1: Add visibility filter (unless admin wants to see hidden groups)
  if (!includeHidden || visibilityContext.userRole !== UserRole.ADMIN) {
    const visibilityFilter = getGroupVisibilityFilter(visibilityContext);
    conditions.push(visibilityFilter);
  }

  // Step 2: Add membership filter for non-admins
  if (visibilityContext.userRole !== UserRole.ADMIN) {
    conditions.push({
      userGroups: {
        some: {
          userId: visibilityContext.userId,
        },
      },
    });
  }

  // Step 3: Add search filter
  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    });
  }

  // Step 4: Combine all conditions
  const where =
    conditions.length > 1 ? { AND: conditions } : conditions[0] || {};

  const [groups, total] = await Promise.all([
    prisma.group.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        visible: true,
        createdAt: true,
        createdBy: true,
        creator: { select: { name: true, email: true } },
        _count: { select: { userGroups: true, events: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.group.count({ where }),
  ]);

  return {
    groups: groups.map(group => ({
      ...group,
      createdAt: group.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
