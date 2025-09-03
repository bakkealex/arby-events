/**
 * Event types and interfaces
 */

import {
  Event as PrismaEvent,
  EventSubscription as PrismaEventSubscription,
} from "@prisma/client";

// Core event interface
export interface Event {
  id: string;
  title: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  location?: string | null;
  groupId: string;
  createdBy: string;
  isPublic: boolean;
  maxParticipants?: number | null;
  currentParticipants: number;
  createdAt: Date;
  updatedAt: Date;
}

// Event with related data
export interface EventWithDetails extends Event {
  group: {
    id: string;
    name: string;
    isHidden: boolean;
  };
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  subscriptions: Array<{
    id: string;
    userId: string;
    subscribedAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  _count: {
    subscriptions: number;
  };
}

// Event subscription
export interface EventSubscription {
  id: string;
  userId: string;
  eventId: string;
  subscribedAt: Date;
  notificationPreferences: NotificationSettings;
}

// Notification settings for events
export interface NotificationSettings {
  emailReminder: boolean;
  emailUpdates: boolean;
  reminderHours: number; // Hours before event to send reminder
}

// Event form data
export interface EventFormData {
  title: string;
  description?: string;
  startDate: string; // ISO string for form handling
  endDate: string; // ISO string for form handling
  location?: string;
  groupId: string;
  isPublic: boolean;
  maxParticipants?: number;
}

// Event calendar data for ICS generation
export interface EventCalendarData {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  organizer: {
    name: string;
    email: string;
  };
  attendees: Array<{
    name: string | null;
    email: string;
  }>;
}

// Event statistics
export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalSubscriptions: number;
  averageParticipants: number;
  popularEvents: Array<{
    id: string;
    title: string;
    participantCount: number;
    startDate: Date;
  }>;
  eventsByMonth: Array<{
    month: string;
    count: number;
  }>;
}

// Event filters for listing
export interface EventFilters {
  groupId?: string;
  startDate?: Date;
  endDate?: Date;
  isPublic?: boolean;
  hasAvailableSpots?: boolean;
  createdBy?: string;
  search?: string;
}

// Event list view
export interface EventListItem {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string | null;
  isPublic: boolean;
  currentParticipants: number;
  maxParticipants?: number | null;
  group: {
    id: string;
    name: string;
  };
  isSubscribed?: boolean; // For user-specific views
  canSubscribe?: boolean; // Based on permissions and availability
}
