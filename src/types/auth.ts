/**
 * Authentication and authorization related types
 */

import { UserRole, AccountStatus } from "@prisma/client";

// Session user type (extended from NextAuth)
export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  active: boolean;
  accountStatus: AccountStatus;
  emailVerified?: Date | null;
  gdprConsentVersion?: string | null;
  gdprConsentDate?: Date | null;
};

// Login credentials
export type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

// Registration data
export type RegistrationData = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  gdprConsent: boolean;
  terms: boolean;
};

// Password reset types
export type PasswordResetRequest = {
  email: string;
};

export type PasswordResetData = {
  token: string;
  password: string;
  confirmPassword: string;
};

// OAuth provider data
export type OAuthProvider = "google" | "github" | "microsoft";

// User role permissions
export type RolePermissions = {
  canManageUsers: boolean;
  canManageGroups: boolean;
  canManageEvents: boolean;
  canViewAdminPanel: boolean;
  canModerateContent: boolean;
  canAccessSettings: boolean;
};

// Account verification
export type AccountVerification = {
  token: string;
  email: string;
  expiresAt: string;
};

// GDPR consent tracking
export type GDPRConsent = {
  version: string;
  consentDate: string;
  ipAddress?: string;
  userAgent?: string;
};
