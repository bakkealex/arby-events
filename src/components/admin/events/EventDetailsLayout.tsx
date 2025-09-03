"use client";
import { useState } from "react";
import EventOverview from "./EventOverview";
import EventSubscribers from "./EventSubscribers";
import EventSettings from "./EventSettings";
import EventTabs from "./EventTabs";

interface EventDetailsLayoutProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
    groupId: string;
    createdBy: string;
    group: {
      id: string;
      name: string;
      description: string | null;
    };
    creator: {
      id: string;
      name: string | null;
      email: string;
    };
    _count: {
      eventSubscriptions: number;
    };
    eventSubscriptions: Array<{
      userId: string;
      subscribedAt: Date;
      user: {
        id: string;
        name: string | null;
        email: string;
        active: boolean;
      };
    }>;
  };
}

export default function EventDetailsLayout({ event }: EventDetailsLayoutProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <EventOverview event={event} />;
      case "subscribers":
        return <EventSubscribers event={event} />;
      case "settings":
        return <EventSettings event={event} />;
      default:
        return <EventOverview event={event} />;
    }
  };

  return (
    <div className="space-y-6">
      <EventTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        event={event}
      />
      <div>{renderTabContent()}</div>
    </div>
  );
}
