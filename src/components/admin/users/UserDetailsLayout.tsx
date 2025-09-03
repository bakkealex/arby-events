"use client";
import { useState } from "react";
import UserStatsCards from "./UserStatsCards";
import UserTabs from "./UserTabs";
import UserOverview from "./UserOverview";
import UserGroups from "./UserGroups";
import UserEvents from "./UserEvents";
import UserSettings from "./UserSettings";

interface UserDetailsLayoutProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    userGroups: Array<{
      userId: string;
      groupId: string;
      role: string;
      joinedAt: string;
      group: {
        id: string;
        name: string;
        description: string | null;
      };
    }>;
    createdEvents: Array<{
      id: string;
      title: string;
      startDate: string;
      endDate: string;
      group: {
        id: string;
        name: string;
      };
    }>;
    eventSubscriptions: Array<{
      userId: string;
      eventId: string;
      subscribedAt: string;
      event: {
        id: string;
        title: string;
        startDate: string;
        endDate: string;
        group: {
          id: string;
          name: string;
        };
      };
    }>;
    _count: {
      userGroups: number;
      createdEvents: number;
      eventSubscriptions: number;
    };
  };
}

export default function UserDetailsLayout({ user }: UserDetailsLayoutProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "groups" | "events" | "settings"
  >("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <UserOverview user={user} />;
      case "groups":
        return <UserGroups user={user} />;
      case "events":
        return <UserEvents user={user} />;
      case "settings":
        return <UserSettings user={user} />;
      default:
        return <UserOverview user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <UserStatsCards user={user} />

        {/* Tabs */}
        <UserTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          groupCount={user._count.userGroups}
          eventCount={user._count.createdEvents}
          subscriptionCount={user._count.eventSubscriptions}
        />

        {/* Tab Content */}
        <div className="mt-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}
