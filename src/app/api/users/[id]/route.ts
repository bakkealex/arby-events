import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  active: z.boolean().optional(),
});

// GET /api/users/[id] - Get user details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      userGroups: {
        include: {
          group: { select: { id: true, name: true } },
        },
      },
      _count: {
        select: {
          userGroups: true,
          createdEvents: true,
          eventSubscriptions: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    userGroups: user.userGroups.map(ug => ({
      ...ug,
      joinedAt: ug.joinedAt.toISOString(),
    })),
  });
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // Only allow users to edit themselves, or admins to edit anyone
  if (session.user.id !== id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = updateUserSchema.parse(body);

  // Prevent non-admins from changing roles
  if (parsed.role && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Cannot change role" }, { status: 403 });
  }

  // Prevent admins from demoting themselves
  if (session.user.id === id && parsed.role && parsed.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Cannot demote yourself" },
      { status: 403 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: parsed,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    ...user,
    updatedAt: user.updatedAt.toISOString(),
  });
}
