import {
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface UserStatsCardsProps {
  user: {
    _count: {
      userGroups: number;
      createdEvents: number;
      eventSubscriptions: number;
    };
    createdEvents: Array<{
      startDate: string;
      endDate: string;
    }>;
    eventSubscriptions: Array<{
      event: {
        startDate: string;
        endDate: string;
      };
    }>;
  };
}

export default function UserStatsCards({ user }: UserStatsCardsProps) {
  const upcomingCreatedEvents = user.createdEvents.filter(
    event => new Date(event.endDate) >= new Date()
  ).length;

  const upcomingSubscriptions = user.eventSubscriptions.filter(
    sub => new Date(sub.event.endDate) >= new Date()
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Group Memberships */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Group Memberships
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {user._count.userGroups}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Created Events */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Created Events
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {user._count.createdEvents}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    ({upcomingCreatedEvents} upcoming)
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Event Subscriptions */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Event Subscriptions
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {user._count.eventSubscriptions}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    ({upcomingSubscriptions} upcoming)
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Account Status
                </dt>
                <dd className="text-lg font-medium text-green-600 dark:text-green-200">
                  Active
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
