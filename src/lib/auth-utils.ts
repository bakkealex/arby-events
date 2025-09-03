import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AuthSession {
  userId: string;
  email: string;
  name: string | null;
  role: UserRole;
  active: boolean;
}

// Role hierarchy: ADMIN > USER
const ROLE_HIERARCHY = {
  [UserRole.USER]: 1,
  [UserRole.ADMIN]: 2,
};

/**
 * Require a minimum role level and active status
 * @param minimumRole - The minimum required role
 * @param requireActive - Whether to require active status (default: true)
 * @returns AuthSession if authorized
 * @throws Error if unauthorized
 */
export async function requireRole(
  minimumRole: UserRole = UserRole.USER,
  requireActive: boolean = true
): Promise<AuthSession> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  // Fetch user from database to get current role and status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      // accountStatus: true, // TODO: Enable after Prisma types update
      // emailVerified: true,  // TODO: Enable after Prisma types update
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is active (if required)
  if (requireActive && !user.active) {
    throw new Error("Account is deactivated");
  }

  // TODO: Enable after Prisma types update
  // Check if account is approved (except for admins)
  // if (user.role !== UserRole.ADMIN && user.accountStatus !== 'APPROVED') {
  //   throw new Error("Account pending approval");
  // }

  // Check role hierarchy
  const userRoleLevel = ROLE_HIERARCHY[user.role];
  const requiredRoleLevel = ROLE_HIERARCHY[minimumRole];

  if (userRoleLevel < requiredRoleLevel) {
    throw new Error(
      `Insufficient permissions. Required: ${minimumRole}, Current: ${user.role}`
    );
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
  };
}

/**
 * Check if user has a specific role (exact match)
 * @param requiredRole - The exact role required
 * @param requireActive - Whether to require active status (default: true)
 */
export async function requireExactRole(
  requiredRole: UserRole,
  requireActive: boolean = true
): Promise<AuthSession> {
  const session = await requireRole(UserRole.USER, requireActive);

  if (session.role !== requiredRole) {
    throw new Error(
      `Exact role required: ${requiredRole}, Current: ${session.role}`
    );
  }

  return session;
}

/**
 * Get current authenticated user session (if any)
 * @returns AuthSession or null
 */
export async function getCurrentUser(): Promise<AuthSession | null> {
  try {
    return await requireRole(UserRole.USER, false); // Don't require active status for just getting user info
  } catch {
    return null;
  }
}

/**
 * Check if user is admin
 */
export async function requireAdmin(): Promise<AuthSession> {
  return await requireRole(UserRole.ADMIN);
}

/**
 * Check if user is authenticated (any role, active or inactive)
 */
export async function requireAuth(): Promise<AuthSession> {
  return await requireRole(UserRole.USER, false); // Don't require active status
}

/**
 * Check if the current user is a group administrator for a specific group
 * @param groupId - The ID of the group to check
 * @returns Promise<boolean> - true if user is group admin or platform admin, false otherwise
 */
export async function isGroupAdmin(groupId: string): Promise<boolean>;
/**
 * Check if a specific user is a group administrator for a specific group
 * @param userId - The ID of the user to check
 * @param groupId - The ID of the group to check
 * @returns Promise<boolean> - true if user is group admin, false otherwise
 */
export async function isGroupAdmin(
  userId: string,
  groupId: string
): Promise<boolean>;
export async function isGroupAdmin(
  userIdOrGroupId: string,
  groupId?: string
): Promise<boolean> {
  try {
    let userId: string;
    let targetGroupId: string;

    if (groupId) {
      // Two-parameter version: isGroupAdmin(userId, groupId)
      userId = userIdOrGroupId;
      targetGroupId = groupId;
    } else {
      // One-parameter version: isGroupAdmin(groupId) - uses current session
      const session = await getCurrentUser();
      if (!session) {
        return false;
      }
      userId = session.userId;
      targetGroupId = userIdOrGroupId;

      // Platform admins can manage any group (only check for current user)
      if (session.role === UserRole.ADMIN) {
        return true;
      }
    }

    // Check if user is group admin
    const userGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: targetGroupId,
        },
      },
      select: {
        role: true,
      },
    });

    return userGroup?.role === "ADMIN";
  } catch {
    return false;
  }
}

/**
 * Require group admin permissions for a specific group
 * @param groupId - The ID of the group to check
 * @returns Promise<AuthSession> - the authenticated session if authorized
 * @throws Error if unauthorized
 */
export async function requireGroupAdmin(groupId: string): Promise<AuthSession> {
  const session = await requireAuth();

  const isAdmin = await isGroupAdmin(groupId);

  if (!isAdmin) {
    throw new Error("Group administrator permissions required");
  }

  return session;
}
