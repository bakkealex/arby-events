"use client";
import { useState } from "react";
import { UserIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

interface EventSubscribersProps {
  event: {
    id: string;
    title: string;
    eventSubscriptions: Array<{
      userId: string;
      subscribedAt: Date;
      user: {
        id: string;
        name: string | null;
        email: string;
        active: boolean;
      };
    }>;
  };
}

export default function EventSubscribers({ event }: EventSubscribersProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubscribers = event.eventSubscriptions.filter(
    subscription =>
      subscription.user.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Event Subscribers ({event.eventSubscriptions.length})
          </h3>
          <input
            type="text"
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  User
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Subscribed At
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map(subscription => (
                <tr
                  key={subscription.userId}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                        <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {subscription.user.name || "No name"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {subscription.user.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {subscription.user.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.user.active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {subscription.user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 dark:text-white">
                      {new Date(subscription.subscribedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSubscribers.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No subscribers found matching your search."
                : "No subscribers yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
