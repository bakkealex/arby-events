import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import {
  canUserSeeGroup,
  type VisibilityContext,
} from "@/lib/visibility-utils";

// POST /api/groups/[id]/join - Join group (Authenticated Users)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = (await params).id;

    // Get user context for visibility check
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const visibilityContext: VisibilityContext = {
      userId: session.user.id,
      userRole: user.role,
      isAuthenticated: true,
    };

    // Check if user can see this group (visibility rules)
    const canSeeGroup = await canUserSeeGroup(groupId, visibilityContext);
    if (!canSeeGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if group exists and get its details
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true, visible: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: groupId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Already a member of this group" },
        { status: 400 }
      );
    }

    // Add user to group
    await prisma.userGroup.create({
      data: {
        userId: session.user.id,
        groupId: groupId,
        role: "MEMBER",
      },
    });

    return NextResponse.json({
      message: "Successfully joined group",
      groupId,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Error joining group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
