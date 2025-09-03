"use client";
import { useState } from "react";
import type { AdminGroupView } from "@/types";
import GroupStatsCards from "./GroupStatsCards";
import GroupTabs from "./GroupTabs";
import GroupOverview from "./GroupOverview";
import GroupMembers from "./GroupMembers";
import GroupEvents from "./GroupEvents";
import GroupSettings from "./GroupSettings";

interface GroupDetailsLayoutProps {
  group: AdminGroupView;
}

export default function GroupDetailsLayout({ group }: GroupDetailsLayoutProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "events" | "settings"
  >("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <GroupOverview group={group} />;
      case "members":
        return <GroupMembers group={group} />;
      case "events":
        return <GroupEvents group={group} />;
      case "settings":
        return <GroupSettings group={group} />;
      default:
        return <GroupOverview group={group} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <GroupStatsCards group={group} />

        {/* Tabs */}
        <GroupTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          memberCount={group._count?.userGroups ?? group.memberCount}
          eventCount={group._count?.events ?? group.eventCount}
        />

        {/* Tab Content */}
        <div className="mt-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}
