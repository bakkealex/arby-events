"use client";

interface UserTabsProps {
  activeTab: "overview" | "groups" | "events" | "settings";
  onTabChange: (tab: "overview" | "groups" | "events" | "settings") => void;
  groupCount: number;
  eventCount: number;
  subscriptionCount: number;
}

export default function UserTabs({
  activeTab,
  onTabChange,
  groupCount,
  eventCount,
  subscriptionCount,
}: UserTabsProps) {
  const tabs = [
    {
      key: "overview" as const,
      name: "Overview",
      count: null,
    },
    {
      key: "groups" as const,
      name: "Groups",
      count: groupCount,
    },
    {
      key: "events" as const,
      name: "Events",
      count: eventCount + subscriptionCount,
    },
    {
      key: "settings" as const,
      name: "Settings",
      count: null,
    },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {tab.name}
            {tab.count !== null && (
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.key
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
