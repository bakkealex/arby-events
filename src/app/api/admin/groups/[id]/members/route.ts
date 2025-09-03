import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const addMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z
    .enum(["MEMBER", "ADMIN"], {
      errorMap: () => ({ message: "Role must be either MEMBER or ADMIN" }),
    })
    .default("MEMBER"),
});

const updateMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["MEMBER", "ADMIN"], {
    errorMap: () => ({ message: "Role must be either MEMBER or ADMIN" }),
  }),
});

// GET /api/admin/groups/[id]/members - List group members (admin view)
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

    // Require admin role
    await requireRole(UserRole.ADMIN);

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Get all group members with user details
    const members = await prisma.userGroup.findMany({
      where: { groupId: id },
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
            createdAt: true,
            role: true,
          },
        },
      },
      orderBy: [
        { role: "desc" }, // Admins first
        { joinedAt: "asc" }, // Then by join date
      ],
    });

    // Transform the response
    const formattedMembers = members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      active: member.user.active,
      userRole: member.user.role,
      groupRole: member.role,
      joinedAt: member.joinedAt,
      createdAt: member.user.createdAt,
    }));

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
      },
      members: formattedMembers,
      totalMembers: formattedMembers.length,
      adminCount: formattedMembers.filter(m => m.groupRole === "ADMIN").length,
      memberCount: formattedMembers.filter(m => m.groupRole === "MEMBER")
        .length,
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

    console.error("Error fetching group members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/groups/[id]/members - Add member to group (admin)
export async function POST(
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
    const validatedData = addMemberSchema.parse(body);

    // Require admin role
    const session = await requireRole(UserRole.ADMIN);

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
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

    if (!user.active) {
      return NextResponse.json(
        { error: "Cannot add inactive user to group" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: validatedData.userId,
          groupId: id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this group" },
        { status: 409 }
      );
    }

    // Add user to group
    const newMember = await prisma.userGroup.create({
      data: {
        userId: validatedData.userId,
        groupId: id,
        role: validatedData.role,
        joinedAt: new Date(),
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
      message: "Member added successfully",
      member: {
        id: newMember.user.id,
        name: newMember.user.name,
        email: newMember.user.email,
        active: newMember.user.active,
        userRole: newMember.user.role,
        groupRole: newMember.role,
        joinedAt: newMember.joinedAt,
      },
      group: {
        id: group.id,
        name: group.name,
      },
      addedBy: {
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

    console.error("Error adding group member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/groups/[id]/members - Update member role in group (admin)
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
    const validatedData = updateMemberSchema.parse(body);

    // Require admin role
    const session = await requireRole(UserRole.ADMIN);

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
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
          userId: validatedData.userId,
          groupId: id,
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
          userId: validatedData.userId,
          groupId: id,
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

    console.error("Error updating group member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
