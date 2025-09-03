import Link from "next/link";
import {
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface EventOverviewProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
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
  };
}

export default function EventOverview({ event }: EventOverviewProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = new Date(event.startDate) > new Date();
  const isPast = new Date(event.endDate) < new Date();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Event Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Event Details
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Start Date
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(event.startDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  End Date
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(event.endDate)}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Location
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {event.location}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <UsersIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Subscribers
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {event._count.eventSubscriptions} people subscribed
                </p>
              </div>
            </div>
          </div>
        </div>

        {event.description && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}
      </div>

      {/* Event Sidebar */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Event Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Status
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isPast
                    ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    : isUpcoming
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                }`}
              >
                {isPast ? "Past" : isUpcoming ? "Upcoming" : "Ongoing"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Created
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {new Date(event.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Updated
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {new Date(event.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Group & Creator
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Group
              </p>
              <Link
                href={`/admin/groups/${event.group.id}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
              >
                {event.group.name}
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Created by
              </p>
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {event.creator.name || "No name"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {event.creator.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
