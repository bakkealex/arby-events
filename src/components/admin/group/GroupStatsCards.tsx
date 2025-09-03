import type { AdminGroupView } from "@/types";
import {
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface GroupStatsCardsProps {
  group: AdminGroupView;
}

export default function GroupStatsCards({ group }: GroupStatsCardsProps) {
  const now = new Date();
  const upcomingEvents = (group.events ?? []).filter(
    event => new Date(event.endDate) >= now
  );
  const activeEvents = (group.events ?? []).filter(
    event => new Date(event.startDate) <= now && new Date(event.endDate) >= now
  );

  const stats = [
    {
      label: "Total Members",
      value: group._count?.userGroups ?? group.memberCount,
      icon: UsersIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Total Events",
      value: group._count?.events ?? group.eventCount,
      icon: CalendarIcon,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents.length,
      icon: ClockIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      label: "Active Events",
      value: activeEvents.length,
      icon: CheckCircleIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
