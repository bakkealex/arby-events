"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PendingUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  gdprConsentDate?: string | null;
  emailVerified?: string | null;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface PendingUsersListProps {
  pendingUsers: PendingUser[];
}

export default function PendingUsersList({
  pendingUsers,
}: PendingUsersListProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(true); // Always collapsed by default

  const handleUserAction = async (
    userId: string,
    action: "approve" | "reject"
  ) => {
    setLoading(prev => ({ ...prev, [userId]: true }));

    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Refresh the page to update the list
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Approval error:", error);
      alert("An error occurred while processing the request");
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Render collapsible section for both cases (with and without pending users)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg p-2 -m-2"
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center transition-transform duration-200">
              {isCollapsed ? (
                <ChevronRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pending User Approvals
            </h2>
            {pendingUsers.length > 0 ? (
              <div className="relative">
                <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
                  {pendingUsers.length} pending
                </span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-md">
                  {pendingUsers.length > 9 ? "9+" : pendingUsers.length}
                </span>
              </div>
            ) : (
              <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                0 pending
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isCollapsed ? "Click to expand" : "Click to collapse"}
          </div>
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-1 duration-200 ease-out">
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                All caught up!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                No users awaiting approval at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map(user => (
                <div
                  key={user.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {user.name || "No name provided"}
                        </h3>
                        <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded text-xs font-medium">
                          PENDING
                        </span>
                        {user.emailVerified && (
                          <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
                            EMAIL VERIFIED
                          </span>
                        )}
                        {!user.emailVerified && (
                          <span className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded text-xs font-medium">
                            EMAIL UNVERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-1">
                        {user.email}
                      </p>
                      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        <p>Registered: {formatDate(user.createdAt)}</p>
                        {user.emailVerified && (
                          <p>
                            Email Verified: {formatDate(user.emailVerified)}
                          </p>
                        )}
                        {user.gdprConsentDate && (
                          <p>
                            GDPR Consent: {formatDate(user.gdprConsentDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleUserAction(user.id, "approve")}
                        disabled={loading[user.id]}
                        className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 text-sm font-medium transition-colors"
                      >
                        {loading[user.id] ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, "reject")}
                        disabled={loading[user.id]}
                        className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 text-sm font-medium transition-colors"
                      >
                        {loading[user.id] ? "Processing..." : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
