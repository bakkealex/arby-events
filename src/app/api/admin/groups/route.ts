import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);

    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            userGroups: true,
            events: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}
