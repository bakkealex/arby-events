"use client";
import { useState } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/constants";

interface UserEventsProps {
  user: {
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

export default function UserEvents({ user }: UserEventsProps) {
  const [activeView, setActiveView] = useState<"created" | "subscribed">(
    "created"
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveView("created")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeView === "created"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600"
              }`}
            >
              Created Events ({user.createdEvents.length})
            </button>
            <button
              onClick={() => setActiveView("subscribed")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeView === "subscribed"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600"
              }`}
            >
              Event Subscriptions ({user.eventSubscriptions.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeView === "created" ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Created Events
              </h3>
              {user.createdEvents.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No events created yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Group
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {user.createdEvents.map(event => (
                        <tr
                          key={event.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/events/${event.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {event.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/groups/${event.group.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {event.group.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {new Date(event.startDate).toLocaleDateString(
                              DEFAULT_LOCALE
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                new Date(event.endDate) >= new Date()
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {new Date(event.endDate) >= new Date()
                                ? "Upcoming"
                                : "Past"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Event Subscriptions
              </h3>
              {user.eventSubscriptions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No event subscriptions yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Group
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Subscribed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {user.eventSubscriptions.map(subscription => (
                        <tr
                          key={subscription.eventId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/events/${subscription.event.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {subscription.event.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/groups/${subscription.event.group.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {subscription.event.group.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {new Date(
                              subscription.subscribedAt
                            ).toLocaleDateString(DEFAULT_LOCALE)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                new Date(subscription.event.endDate) >=
                                new Date()
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {new Date(subscription.event.endDate) >=
                              new Date()
                                ? "Upcoming"
                                : "Past"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
