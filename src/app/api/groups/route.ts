import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";

const createGroupSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

// GET /api/groups - List groups
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  // Check if user is admin - admins can see all groups
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const where: Record<string, unknown> = {};

  // If not admin, only show groups the user is a member of
  if (user?.role !== UserRole.ADMIN) {
    where.userGroups = {
      some: {
        userId: session.user.id,
      },
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [groups, total] = await Promise.all([
    prisma.group.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        creator: { select: { name: true, email: true } },
        _count: { select: { userGroups: true, events: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.group.count({ where }),
  ]);

  return NextResponse.json({
    groups: groups.map(group => ({
      ...group,
      createdAt: group.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/groups - Create group (Admin only)
export async function POST(req: NextRequest) {
  try {
    // Require admin role to create groups
    const authSession = await requireRole(UserRole.ADMIN);

    const body = await req.json();
    const parsed = createGroupSchema.parse(body);

    const group = await prisma.group.create({
      data: {
        ...parsed,
        createdBy: authSession.userId,
        userGroups: {
          create: {
            userId: authSession.userId,
            role: "ADMIN",
            joinedAt: new Date(),
          },
        },
      },
      include: {
        creator: { select: { name: true, email: true } },
        _count: { select: { userGroups: true } },
      },
    });

    return NextResponse.json(
      {
        ...group,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    if (
      errorMessage === "Authentication required" ||
      errorMessage.includes("role")
    ) {
      return NextResponse.json(
        { error: "Unauthorized. Only administrators can create groups." },
        { status: 403 }
      );
    }

    console.error("Group creation error:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
