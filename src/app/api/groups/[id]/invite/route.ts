import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId } = await params;

  // Check if group exists
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Check if user is already a member
  const existingMembership = await prisma.userGroup.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId,
      },
    },
  });

  if (existingMembership) {
    return NextResponse.json({ error: "Already a member" }, { status: 400 });
  }

  // Create membership
  const membership = await prisma.userGroup.create({
    data: {
      userId: session.user.id,
      groupId,
      role: "MEMBER",
      joinedAt: new Date(),
    },
  });

  return NextResponse.json({
    message: "Successfully joined group",
    membership: {
      ...membership,
      joinedAt: membership.joinedAt.toISOString(),
    },
  });
}
