import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const searchParamsSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  excludeGroup: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Require admin role
    await requireRole(UserRole.ADMIN);
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const excludeGroup = searchParams.get("excludeGroup") || "";

    if (!q) {
      return NextResponse.json({ users: [] });
    }

    searchParamsSchema.parse({
      q,
      excludeGroup: excludeGroup || undefined,
    });

    // Find users matching query, excluding those in the given group
    const users = await prisma.user.findMany({
      where: {
        OR: [{ name: { contains: q } }, { email: { contains: q } }],
        AND: excludeGroup
          ? [
              {
                userGroups: {
                  none: { groupId: excludeGroup },
                },
              },
            ]
          : [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
