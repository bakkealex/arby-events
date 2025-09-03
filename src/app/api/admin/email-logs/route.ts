import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getEmailStats } from "@/lib/email-enhanced";

// GET /api/admin/email-logs - View email logs and statistics (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const emailType = searchParams.get("emailType");
    const status = searchParams.get("status");
    const days = parseInt(searchParams.get("days") || "7");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (emailType) where.emailType = emailType;
    if (status) where.status = status;

    // Date filter
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    where.createdAt = { gte: startDate };

    // Use raw query until Prisma client is updated
    const emailLogs = await prisma.$queryRaw`
      SELECT 
        id,
        toEmail,
        fromEmail,
        subject,
        emailType,
        status,
        attempts,
        sentAt,
        errorCode,
        errorMessage,
        provider,
        messageId,
        createdAt,
        updatedAt
      FROM email_logs 
      WHERE createdAt >= ${startDate}
      ${emailType ? `AND emailType = ${emailType}` : ""}
      ${status ? `AND status = ${status}` : ""}
      ORDER BY createdAt DESC 
      LIMIT ${limit} 
      OFFSET ${skip}
    `;

    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM email_logs 
      WHERE createdAt >= ${startDate}
      ${emailType ? `AND emailType = ${emailType}` : ""}
      ${status ? `AND status = ${status}` : ""}
    `;

    // Get email statistics
    const stats = await getEmailStats();

    return NextResponse.json({
      emailLogs,
      pagination: {
        page,
        limit,
        total: Number((totalCount as Array<{ count: number }>)[0]?.count || 0),
        pages: Math.ceil(
          Number((totalCount as Array<{ count: number }>)[0]?.count || 0) /
            limit
        ),
      },
      stats,
      filters: {
        days,
        emailType,
        status,
      },
    });
  } catch (error) {
    console.error("Error fetching email logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch email logs" },
      { status: 500 }
    );
  }
}
