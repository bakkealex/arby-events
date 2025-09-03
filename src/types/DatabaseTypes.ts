// UserRole and GroupRole enums
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum GroupRole {
  MEMBER = "MEMBER",
  ADMIN = "ADMIN",
}

// User type
export type User = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

// Group type
export type Group = {
  id: string;
  name: string;
  description?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

// UserGroup type
export type UserGroup = {
  userId: string;
  groupId: string;
  role: GroupRole;
  joinedAt: string;
  user?: User;
  group?: Group;
};

// Event type
export type Event = {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  location?: string | null;
  groupId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  group?: Group;
  creator?: User;
  eventSubscriptions?: EventSubscription[];
};

// EventSubscription type
export type EventSubscription = {
  userId: string;
  eventId: string;
  subscribedAt: string;
  user?: User;
  event?: Event;
};
