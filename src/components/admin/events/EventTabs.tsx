interface EventTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  event: {
    _count: {
      eventSubscriptions: number;
    };
  };
}

export default function EventTabs({
  activeTab,
  onTabChange,
  event,
}: EventTabsProps) {
  const tabs = [
    {
      id: "overview",
      name: "Overview",
      count: null,
    },
    {
      id: "subscribers",
      name: "Subscribers",
      count: event._count.eventSubscriptions,
    },
    {
      id: "settings",
      name: "Settings",
      count: null,
    },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {tab.name}
            {tab.count !== null && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
