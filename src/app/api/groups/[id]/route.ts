import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, isGroupAdmin } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { z } from "zod";

// Validation schemas
const updateGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(100, "Group name too long")
    .optional(),
  description: z.string().max(500, "Description too long").optional(),
});

// GET /api/groups/[id] - Get group details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate group ID
    if (!id) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Get current user (can be any authenticated user)
    const session = await requireRole(UserRole.USER);

    // Fetch group with basic details
    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            userGroups: true,
            events: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user has access to this group
    const userGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: session.userId,
          groupId: id,
        },
      },
    });

    // Only allow access if user is member, group admin, or platform admin
    if (!userGroup && session.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Access denied. You are not a member of this group." },
        { status: 403 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/groups/[id] - Update group
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate group ID
    if (!id) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateGroupSchema.parse(body);

    // Check if there's actually something to update
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // Get current user
    const session = await requireRole(UserRole.USER);

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdBy: true,
      },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check permissions
    const canEdit =
      session.role === UserRole.ADMIN ||
      (await isGroupAdmin(session.userId, id));

    if (!canEdit) {
      return NextResponse.json(
        {
          error:
            "Access denied. You must be a group administrator to edit this group.",
        },
        { status: 403 }
      );
    }

    // Check for name conflicts if name is being updated
    if (validatedData.name && validatedData.name !== existingGroup.name) {
      const nameConflict = await prisma.group.findFirst({
        where: {
          name: validatedData.name,
          id: { not: id },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: "A group with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Update the group
    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            userGroups: true,
            events: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id] - Delete group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate group ID
    if (!id) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Get current user - only admins can delete groups
    await requireRole(UserRole.ADMIN);

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            userGroups: true,
            events: true,
          },
        },
      },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Use a transaction to safely delete the group and all related data
    await prisma.$transaction(async tx => {
      // Delete all event subscriptions for events in this group
      await tx.eventSubscription.deleteMany({
        where: {
          event: {
            groupId: id,
          },
        },
      });

      // Delete all events in this group
      await tx.event.deleteMany({
        where: {
          groupId: id,
        },
      });

      // Delete all user-group relationships
      await tx.userGroup.deleteMany({
        where: {
          groupId: id,
        },
      });

      // Finally, delete the group itself
      await tx.group.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: "Group deleted successfully",
      deletedGroup: {
        id: existingGroup.id,
        name: existingGroup.name,
        memberCount: existingGroup._count.userGroups,
        eventCount: existingGroup._count.events,
      },
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
