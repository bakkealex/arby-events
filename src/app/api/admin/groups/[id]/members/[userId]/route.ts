import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const updateMemberRoleSchema = z.object({
  role: z.enum(["MEMBER", "ADMIN"], {
    errorMap: () => ({ message: "Role must be either MEMBER or ADMIN" }),
  }),
});

// DELETE /api/admin/groups/[id]/members/[userId] - Remove member from group (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: groupId, userId } = await params;

    // Validate parameters
    if (!groupId || !userId) {
      return NextResponse.json(
        { error: "Group ID and User ID are required" },
        { status: 400 }
      );
    }

    // Require admin role
    const session = await requireRole(UserRole.ADMIN);

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a member of the group
    const existingMember = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      select: {
        role: true,
        joinedAt: true,
      },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "User is not a member of this group" },
        { status: 404 }
      );
    }

    // Remove user from group
    await prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    return NextResponse.json({
      message: "Member removed successfully",
      removedMember: {
        id: user.id,
        name: user.name,
        email: user.email,
        userRole: user.role,
        groupRole: existingMember.role,
        joinedAt: existingMember.joinedAt,
      },
      group: {
        id: group.id,
        name: group.name,
      },
      removedBy: {
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

    console.error("Error removing group member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/groups/[id]/members/[userId] - Update member role in group (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: groupId, userId } = await params;

    // Validate parameters
    if (!groupId || !userId) {
      return NextResponse.json(
        { error: "Group ID and User ID are required" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateMemberRoleSchema.parse(body);

    // Require admin role
    const session = await requireRole(UserRole.ADMIN);

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a member of the group
    const existingMember = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "User is not a member of this group" },
        { status: 404 }
      );
    }

    // Update user role in group
    const updatedMember = await prisma.userGroup.update({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      data: {
        role: validatedData.role,
      },
      select: {
        userId: true,
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            active: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Member role updated successfully",
      member: {
        id: updatedMember.user.id,
        name: updatedMember.user.name,
        email: updatedMember.user.email,
        active: updatedMember.user.active,
        userRole: updatedMember.user.role,
        groupRole: updatedMember.role,
        joinedAt: updatedMember.joinedAt,
        previousRole: existingMember.role,
      },
      group: {
        id: group.id,
        name: group.name,
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

    console.error("Error updating group member role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
