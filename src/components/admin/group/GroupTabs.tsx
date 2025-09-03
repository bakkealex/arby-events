interface GroupTabsProps {
  activeTab: "overview" | "members" | "events" | "settings";
  onTabChange: (tab: "overview" | "members" | "events" | "settings") => void;
  memberCount: number;
  eventCount: number;
}

export default function GroupTabs({
  activeTab,
  onTabChange,
  memberCount,
  eventCount,
}: GroupTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview", count: null },
    { id: "members", label: "Members", count: memberCount },
    { id: "events", label: "Events", count: eventCount },
    { id: "settings", label: "Settings", count: null },
  ] as const;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
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
