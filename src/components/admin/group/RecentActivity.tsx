import { DEFAULT_LOCALE } from "@/lib/constants";
import type { AdminGroupView } from "@/types";
import {
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface RecentActivityProps {
  group: AdminGroupView;
}

export default function RecentActivity({ group }: RecentActivityProps) {
  // Generate recent activity from group data
  const activities = [
    ...(group.events ?? []).slice(0, 3).map(event => ({
      id: `event-${event.id}`,
      type: "event" as const,
      title: `Event: ${event.title}`,
      description: `Created on ${new Date(event.createdAt).toLocaleDateString(DEFAULT_LOCALE)}`,
      timestamp: event.createdAt,
      icon: CalendarIcon,
    })),
    ...(group.userGroups ?? []).slice(0, 2).map(member => ({
      id: `member-${member.userId}`,
      type: "member" as const,
      title: `New member: ${member.user?.name || member.user?.email}`,
      description: `Joined as ${member.role.toLowerCase()} on ${new Date(member.joinedAt).toLocaleDateString(DEFAULT_LOCALE)}`,
      timestamp: member.joinedAt,
      icon: UserGroupIcon,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Recent Activity
      </h3>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  activity.type === "event"
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-green-50 dark:bg-green-900/20"
                }`}
              >
                <activity.icon
                  className={`h-4 w-4 ${
                    activity.type === "event"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.description}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-400 dark:text-gray-500">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {new Date(activity.timestamp).toLocaleDateString(
                    DEFAULT_LOCALE
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <ClockIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      )}
    </div>
  );
}
