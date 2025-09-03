import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface EventStatsCardsProps {
  stats: {
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    totalSubscriptions: number;
  };
}

export default function EventStatsCards({ stats }: EventStatsCardsProps) {
  const cards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: CalendarIcon,
      color: "bg-blue-500",
      description: "All events on platform",
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      icon: ClockIcon,
      color: "bg-green-500",
      description: "Events starting soon",
    },
    {
      title: "Past Events",
      value: stats.pastEvents,
      icon: CheckCircleIcon,
      color: "bg-gray-500",
      description: "Completed events",
    },
    {
      title: "Total Subscriptions",
      value: stats.totalSubscriptions,
      icon: UserGroupIcon,
      color: "bg-purple-500",
      description: "User event subscriptions",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map(card => (
        <div
          key={card.title}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}
