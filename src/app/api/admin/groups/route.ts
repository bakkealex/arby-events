import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  visible: z.boolean().optional().default(true),
});

// GET /api/admin/groups - List all groups for admin management
export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);

    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        visible: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        creator: {
          select: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      groups: groups.map(group => ({
        ...group,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// POST /api/admin/groups - Create group (Admin only)
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
        _count: { select: { userGroups: true, events: true } },
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

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
