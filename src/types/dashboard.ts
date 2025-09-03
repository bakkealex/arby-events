/**
 * Dashboard and statistics related types
 */

// Group statistics for dashboard
export type GroupStats = {
  totalGroups: number;
  activeGroups: number;
  groupsWithEvents: number;
  totalMembers: number;
  recentGroups: Array<{
    id: string;
    name: string;
    createdAt: string;
    _count: {
      userGroups: number;
      events: number;
    };
  }>;
};

// User statistics
export type UserStats = {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  pendingApprovals: number;
};

// Event statistics
export type EventStats = {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  eventsThisMonth: number;
  averageAttendance: number;
};

// Admin dashboard statistics
export type AdminDashboardStats = {
  userCount: number;
  groupCount: number;
  eventCount: number;
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
    role: string;
  }>;
  groupStats: GroupStats;
};

// Activity log entry
export type ActivityLogEntry = {
  id: string;
  type: "user" | "group" | "event" | "system";
  action: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
};

// Quick stats card data
export type StatsCardData = {
  title: string;
  value: number | string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  color: "blue" | "green" | "purple" | "yellow" | "red" | "gray";
};
