import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isGroupAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const notificationSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(1, "Message is required").max(2000),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  sendToAll: z.boolean().default(true),
  scheduleFor: z.string().optional().nullable(),
});

function generateNotificationEmail(
  subject: string,
  message: string,
  priority: "low" | "normal" | "high",
  groupName: string,
  senderName: string
) {
  const priorityColor = {
    low: "#10b981",
    normal: "#3b82f6",
    high: "#ef4444",
  };

  const priorityIcon = {
    low: "ℹ️",
    normal: "📢",
    high: "⚠️",
  };

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background-color: ${priorityColor[priority]}; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; text-align: center;">
          ${priorityIcon[priority]} Group Notification
        </h1>
        <p style="margin: 10px 0 0 0; text-align: center; opacity: 0.9;">
          From: ${groupName}
        </p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1e40af; margin-top: 0; margin-bottom: 20px;">
          ${subject}
        </h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${priorityColor[priority]};">
          <div style="color: #374151; line-height: 1.6; white-space: pre-line;">
            ${message}
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e0f2fe; border-radius: 8px;">
          <p style="margin: 0; color: #0369a1; font-size: 14px;">
            <strong>Priority:</strong> ${priority.charAt(0).toUpperCase() + priority.slice(1)}
            <br>
            <strong>Sent by:</strong> ${senderName}
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL}/groups" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; font-weight: bold;">
          View Group
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      
      <p style="color: #64748b; font-size: 14px; text-align: center;">
        You're receiving this notification because you're a member of ${groupName}.
        <br>
        <a href="${process.env.APP_URL}/groups" style="color: #64748b;">Manage Group Settings</a>
      </p>
    </div>
  `;

  const text = `
    Group Notification - ${subject}
    
    From: ${groupName}
    Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}
    Sent by: ${senderName}
    
    Message:
    ${message}
    
    View group at: ${process.env.APP_URL}/groups
  `;

  return { html, text };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: groupId } = await params;
    const body = await req.json();

    // Validate input
    let parsed;
    try {
      parsed = notificationSchema.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Check permissions: Admins can send to any group, group admins can send to their groups
    const isUserAdmin = session.user.role === "ADMIN";
    const isUserGroupAdmin = !isUserAdmin
      ? await isGroupAdmin(session.user.id, groupId)
      : true;

    if (!isUserAdmin && !isUserGroupAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify group exists and get group details
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        userGroups: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Get sender information
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    const senderName = sender?.name || sender?.email || "System Administrator";

    // Handle scheduled notifications
    if (parsed.scheduleFor) {
      const scheduleDate = new Date(parsed.scheduleFor);
      if (scheduleDate <= new Date()) {
        return NextResponse.json(
          { error: "Schedule date must be in the future" },
          { status: 400 }
        );
      }

      // For now, we'll store scheduled notifications in the database
      // You could implement a job queue system for production
      const notification = await prisma.notification.create({
        data: {
          subject: parsed.subject,
          message: parsed.message,
          priority: parsed.priority,
          groupId,
          senderId: session.user.id,
          scheduledFor: scheduleDate,
          status: "SCHEDULED",
        },
      });

      return NextResponse.json(
        {
          message: "Notification scheduled successfully",
          notificationId: notification.id,
          scheduledFor: scheduleDate.toISOString(),
        },
        { status: 201 }
      );
    }

    // Send immediate notifications
    const recipients = group.userGroups
      .filter(
        userGroup => parsed.sendToAll || userGroup.user.id === session.user.id
      )
      .map(userGroup => userGroup.user);

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found" },
        { status: 400 }
      );
    }

    // Generate email content
    const { html, text } = generateNotificationEmail(
      parsed.subject,
      parsed.message,
      parsed.priority,
      group.name,
      senderName
    );

    // Send emails to all recipients
    const emailPromises = recipients.map(async recipient => {
      try {
        const result = await sendEmail({
          to: recipient.email,
          subject: `[${group.name}] ${parsed.subject}`,
          html,
          text,
        });

        // Log the notification in the database
        await prisma.notification.create({
          data: {
            subject: parsed.subject,
            message: parsed.message,
            priority: parsed.priority,
            groupId,
            senderId: session.user.id,
            recipientId: recipient.id,
            status: result.success ? "SENT" : "FAILED",
            sentAt: result.success ? new Date() : null,
            errorMessage: result.success ? null : String(result.error),
          },
        });

        return {
          recipientId: recipient.id,
          email: recipient.email,
          success: result.success,
          error: result.success ? null : result.error,
        };
      } catch (error) {
        console.error(
          `Failed to send notification to ${recipient.email}:`,
          error
        );
        return {
          recipientId: recipient.id,
          email: recipient.email,
          success: false,
          error: error,
        };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json(
      {
        message: "Notification sending completed",
        totalRecipients: recipients.length,
        successCount,
        failureCount,
        results: results.map(r => ({
          email: r.email,
          success: r.success,
          error: r.error ? String(r.error) : null,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Notification sending error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
