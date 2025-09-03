"use client";
import { useState } from "react";
import { DEFAULT_LOCALE } from "@/lib/constants";
import type { AdminGroupView } from "@/types";
import SendNotificationModal from "@/components/admin/shared/modals/SendNotificationModal";
import RecentActivity from "./RecentActivity";
import GroupQuickActions from "./GroupQuickActions";

interface GroupOverviewProps {
  group: AdminGroupView;
}

export default function GroupOverview({ group }: GroupOverviewProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleCloseModal = () => setActiveModal(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Group Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Group Details
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Group ID
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white font-mono">
                  {group.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Creator
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {group.creator?.name || group.creator?.email || "Unknown"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {new Date(group.createdAt).toLocaleDateString(DEFAULT_LOCALE)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Updated
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {new Date(
                    group.updatedAt || group.createdAt
                  ).toLocaleDateString(DEFAULT_LOCALE)}
                </dd>
              </div>
            </dl>
            <dl className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {group.description || "No description provided"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Recent Activity */}
          <RecentActivity group={group} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <GroupQuickActions group={group} />

          {/* Recent Members */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Recent Members
            </h3>
            <div className="space-y-3">
              {group.userGroups?.slice(0, 5).map(member => (
                <div
                  key={member.userId}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {(member.user?.name ||
                        member.user?.email ||
                        "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {member.user?.name || member.user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.role} • Joined{" "}
                      {new Date(member.joinedAt).toLocaleDateString(
                        DEFAULT_LOCALE
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SendNotificationModal
        open={activeModal === "send-notification"}
        onClose={handleCloseModal}
        groupId={group.id}
      />
    </>
  );
}
