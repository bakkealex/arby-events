import nodemailer from "nodemailer";
import { config } from "./config";

// Temporary minimal email implementation for build fix
// TODO: Restore full email logging functionality after Prisma issues resolved

export enum EmailType {
  VERIFICATION = "VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
  WELCOME = "WELCOME",
  EVENT_NOTIFICATION = "EVENT_NOTIFICATION",
  EVENT_REMINDER = "EVENT_REMINDER",
  EVENT_CANCELLED = "EVENT_CANCELLED",
  GROUP_INVITATION = "GROUP_INVITATION",
  GROUP_NOTIFICATION = "GROUP_NOTIFICATION",
  ADMIN_NOTIFICATION = "ADMIN_NOTIFICATION",
  GDPR_DATA_EXPORT = "GDPR_DATA_EXPORT",
  ACCOUNT_APPROVED = "ACCOUNT_APPROVED",
  ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED",
  ACCOUNT_DELETED = "ACCOUNT_DELETED",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  OTHER = "OTHER",
}

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  type?: EmailType;
  userId?: string;
  referenceId?: string;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.secure,
    auth: {
      user: config.email.smtp.user,
      pass: config.email.smtp.pass,
    },
  });
};

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

// Utility functions for compatibility
export function generateVerificationEmail(verifyUrl: string, appName: string) {
  return {
    subject: `Verify your email - ${appName}`,
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verifyUrl}">Verify Email</a>
    `,
    text: `Please verify your email by visiting: ${verifyUrl}`,
  };
}

export function generateApprovalEmail(userName: string, appName: string) {
  return {
    subject: `Account Approved - ${appName}`,
    html: `
      <h1>Account Approved</h1>
      <p>Hello ${userName},</p>
      <p>Your account has been approved and you can now access the platform.</p>
    `,
    text: `Hello ${userName}, your account has been approved and you can now access the platform.`,
  };
}

// Stub functions for compatibility with existing code
export async function getEmailStats() {
  return {
    totalEmails: 0,
    byStatus: {},
    byType: {},
    successRate: 0,
    recentFailures: [],
  };
}

export async function retryFailedEmails() {
  return { retriedCount: 0, successCount: 0, failureCount: 0 };
}
