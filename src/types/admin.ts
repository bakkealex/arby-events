/**
 * Admin view types and interfaces
 */

import { UserRole, GroupRole, AccountStatus } from "@prisma/client";

// Admin user view (remove I prefix)
export interface AdminUserView {
  id: string;
  name: string | null;
  email: string;
  active?: boolean;
  role: UserRole;
  createdAt: string;
  accountStatus?: AccountStatus;
  emailVerified?: string | null;
  gdprConsentDate?: string | null;
  gdprConsentVersion?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  userGroups?: { id: string; name: string }[];
  _count?: { userGroups: number };
}

// Admin group view (remove I prefix)
export interface AdminGroupView {
  id: string;
  name: string;
  description?: string | null;
  isHidden: boolean;
  createdAt: string;
  createdBy: string;
  /** Optional fields maintained for compatibility with legacy components */
  updatedAt?: string;
  creator?: {
    id: string;
    name?: string | null;
    email: string;
  };
  userGroups?: Array<{
    userId: string;
    groupId: string;
    role: string;
    joinedAt: string; // ISO string
    user?: {
      id: string;
      name?: string | null;
      email: string;
      role?: string;
    };
  }>;
  events?: Array<{
    id: string;
    title: string;
    description?: string | null;
    startDate: string; // ISO string
    endDate: string; // ISO string
    location?: string | null;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    groupId: string;
    createdBy: string;
    creator?: {
      id: string;
      name?: string | null;
      email: string;
    };
    _count?: {
      eventSubscriptions: number;
    };
  }>;
  _count?: {
    userGroups: number;
    events: number;
  };
  /** Newer summary-style fields */
  memberCount: number;
  eventCount: number;
  administrators: Array<{
    id: string;
    name: string | null;
    email: string;
    role: GroupRole;
  }>;
  recentActivity?: Array<{
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
}

// Admin dashboard statistics
export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  totalGroups: number;
  publicGroups: number;
  hiddenGroups: number;
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  recentActivity: ActivityLog[];
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
  eventStats: Array<{
    month: string;
    events: number;
    participants: number;
  }>;
}

// Activity log for admin dashboard
export interface ActivityLog {
  id: string;
  type:
    | "user_registered"
    | "user_approved"
    | "group_created"
    | "event_created"
    | "event_subscribed";
  description: string;
  userId?: string;
  userName?: string;
  groupId?: string;
  groupName?: string;
  eventId?: string;
  eventTitle?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Admin page props
export interface AdminPageProps {
  initialData?: any;
  permissions: string[];
  className?: string;
}

// Admin user management props
export interface AdminUserManagementProps extends AdminPageProps {
  users: AdminUserView[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

// Admin group management props
export interface AdminGroupManagementProps extends AdminPageProps {
  groups: AdminGroupView[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

// Admin settings
export interface AdminSettings {
  requireApproval: boolean;
  allowRegistration: boolean;
  gdprConsentVersion: string;
  emailSettings: {
    fromName: string;
    fromEmail: string;
    replyTo?: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
  };
  accountCleanup: {
    deleteUnverifiedAfterDays: number;
    deleteUnapprovedAfterDays: number;
    warningDaysBeforeCleanup: number;
  };
  platformLimits: {
    maxGroupsPerUser: number;
    maxEventsPerGroup: number;
    maxParticipantsPerEvent: number;
  };
}

// Admin group full details (used by GroupDetails component)
export interface GroupWithDetails {
  id: string;
  name: string;
  description?: string | null;
  createdBy: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  creator: {
    id: string;
    name: string | null;
    email: string | null;
  };
  userGroups: Array<{
    userId: string;
    groupId: string;
    role: GroupRole | "ADMIN" | "MEMBER"; // tolerate string role
    joinedAt: string; // ISO string
    user?: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
  events: Array<{
    id: string;
    title: string;
    description?: string | null;
    startDate: string | Date;
    endDate: string | Date;
    location?: string | null;
    groupId: string;
    createdBy: string;
    createdAt: string | Date;
    updatedAt: string | Date;
  }>;
}
