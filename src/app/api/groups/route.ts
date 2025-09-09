import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { type VisibilityContext } from "@/lib/visibility-utils";
import { getGroupsList } from "@/lib/groups-service";

// GET /api/groups - List groups for authenticated users
export async function GET(req: NextRequest) {
  // Check if user is logged in
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const includeHidden = searchParams.get("include_hidden") === "true";

  // Get user context for visibility filtering
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

  try {
    const result = await getGroupsList(visibilityContext, {
      search,
      page,
      limit,
      includeHidden,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// NOTE: Group creation moved to /api/admin/groups for admin-only operations
// This endpoint focuses on user-facing group interactions only
