import nodemailer from "nodemailer";
import { config } from "./config";

const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.secure,
  auth: {
    user: config.email.smtp.user,
    pass: config.email.smtp.pass,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `${config.email.fromName} <${config.email.from}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML if no text provided
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
}

export function generateEventNotificationEmail(
  eventTitle: string,
  eventDescription: string,
  startDate: Date,
  endDate: Date,
  location?: string,
  isUpdate = false
) {
  const subject = isUpdate
    ? `Event Updated: ${eventTitle}`
    : `New Event: ${eventTitle}`;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #2563eb; text-align: center;">
        ${isUpdate ? "📅 Event Updated" : "🎉 New Event"}
      </h1>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h2 style="color: #1e40af; margin-top: 0;">${eventTitle}</h2>
        
        ${eventDescription ? `<p style="color: #475569; margin: 10px 0;">${eventDescription}</p>` : ""}
        
        <div style="margin: 15px 0;">
          <strong style="color: #1e40af;">📅 Start:</strong> ${formatDate(startDate)}<br>
          <strong style="color: #1e40af;">📅 End:</strong> ${formatDate(endDate)}
        </div>
        
        ${
          location
            ? `<div style="margin: 15px 0;">
          <strong style="color: #1e40af;">📍 Location:</strong> ${location}
        </div>`
            : ""
        }
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL}/events" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; font-weight: bold;">
          View Event Details
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      
      <p style="color: #64748b; font-size: 14px; text-align: center;">
        You're receiving this email because you're subscribed to events in this group.
        <br>
        <a href="${process.env.APP_URL}/unsubscribe" style="color: #64748b;">Unsubscribe</a>
      </p>
    </div>
  `;

  const text = `
    ${isUpdate ? "Event Updated" : "New Event"}: ${eventTitle}
    
    ${eventDescription || ""}
    
    Start: ${formatDate(startDate)}
    End: ${formatDate(endDate)}
    ${location ? `Location: ${location}` : ""}
    
    View details at: ${process.env.APP_URL}/events
  `;

  return { subject, html, text };
}
