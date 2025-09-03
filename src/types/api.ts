/**
 * API request and response types
 */

import { UserRole, GroupRole } from "@prisma/client";

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Authentication API
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    active: boolean;
  };
  token?: string;
  expires?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  gdprConsent: boolean;
  gdprConsentVersion: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  requiresApproval: boolean;
  message: string;
}

// Password reset
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  resetToken?: string;
}

export interface PasswordUpdateRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Email verification
export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  message: string;
  verified: boolean;
}

// User management API
export interface UserCreateRequest {
  email: string;
  name: string;
  password?: string;
  role?: UserRole;
  sendCredentials?: boolean;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
}

// Group management API
export interface GroupCreateRequest {
  name: string;
  description?: string;
  isHidden?: boolean;
}

export interface GroupUpdateRequest {
  name?: string;
  description?: string;
  isHidden?: boolean;
}

export interface GroupMemberRequest {
  userId: string;
  role?: GroupRole;
}

// Event management API
export interface EventCreateRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  groupId: string;
  isPublic?: boolean;
  maxParticipants?: number;
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  isPublic?: boolean;
  maxParticipants?: number;
}

export interface EventSubscriptionRequest {
  eventId: string;
  notificationPreferences?: {
    emailReminder?: boolean;
    emailUpdates?: boolean;
    reminderHours?: number;
  };
}
