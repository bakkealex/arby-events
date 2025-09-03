"use client";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/constants";
import UserQuickActions from "./UserQuickActions";

interface UserOverviewProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    userGroups: Array<{
      userId: string;
      groupId: string;
      role: string;
      joinedAt: string;
      group: {
        id: string;
        name: string;
        description: string | null;
      };
    }>;
    createdEvents: Array<{
      id: string;
      title: string;
      startDate: string;
      endDate: string;
      group: {
        id: string;
        name: string;
      };
    }>;
    eventSubscriptions: Array<{
      userId: string;
      eventId: string;
      subscribedAt: string;
      event: {
        id: string;
        title: string;
        startDate: string;
        endDate: string;
        group: {
          id: string;
          name: string;
        };
      };
    }>;
  };
}

export default function UserOverview({ user }: UserOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* User Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            User Details
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                User ID
              </dt>
              <dd className="text-sm text-gray-900 font-mono dark:text-gray-100">
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Name
              </dt>
              <dd className="text-sm text-gray-900 dark:text-gray-100">
                {user.name || (
                  <span className="italic text-gray-400 dark:text-gray-500">
                    No name
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </dt>
              <dd className="text-sm text-gray-900 dark:text-gray-100">
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Role
              </dt>
              <dd className="text-sm text-gray-900 dark:text-gray-100">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    user.role === "ADMIN"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {user.role}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created
              </dt>
              <dd className="text-sm text-gray-900 dark:text-gray-100">
                {new Date(user.createdAt).toLocaleDateString(DEFAULT_LOCALE)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Updated
              </dt>
              <dd className="text-sm text-gray-900 dark:text-gray-100">
                {new Date(user.updatedAt).toLocaleDateString(DEFAULT_LOCALE)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Recent Created Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Created Events
          </h3>
          {user.createdEvents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No events created yet.
            </p>
          ) : (
            <div className="space-y-3">
              {user.createdEvents.slice(0, 5).map(event => (
                <div
                  key={event.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700"
                >
                  <div>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-medium text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {event.title}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(event.startDate).toLocaleDateString(
                        DEFAULT_LOCALE
                      )}{" "}
                      in{" "}
                      <Link
                        href={`/admin/groups/${event.group.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {event.group.name}
                      </Link>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(event.endDate) >= new Date()
                        ? "Upcoming"
                        : "Past"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <UserQuickActions user={user} />

        {/* Recent Group Memberships */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Groups
          </h3>
          {user.userGroups.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">
              Not a member of any groups.
            </p>
          ) : (
            <div className="space-y-3">
              {user.userGroups.slice(0, 5).map(membership => (
                <div
                  key={membership.groupId}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {membership.group.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/groups/${membership.group.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate block"
                    >
                      {membership.group.name}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {membership.role} • Joined{" "}
                      {new Date(membership.joinedAt).toLocaleDateString(
                        DEFAULT_LOCALE
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
