"use client";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/constants";
import type { GroupStats } from "@/types/dashboard";

export default function GroupsOverviewCard({ stats }: { stats: GroupStats }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Group Management
        </h2>
        <Link
          href="/admin/groups"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border dark:border-green-800">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.totalGroups}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total Groups
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border dark:border-blue-800">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalMembers}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total Members
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border dark:border-purple-800">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.groupsWithEvents}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Active Groups
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border dark:border-yellow-800">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.activeGroups}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Recent Activity
          </p>
        </div>
      </div>

      {/* Recent Groups */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Recent Groups
        </h3>
        <div className="space-y-2">
          {stats.recentGroups.map(group => (
            <div
              key={group.id}
              className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700"
            >
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {group.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(group.createdAt).toLocaleDateString(DEFAULT_LOCALE)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {group._count.userGroups} members
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {group._count.events} events
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/admin/groups/create"
          className="btn btn-sm btn-success"
        >
          Create Group
        </Link>
        <Link
          href="/admin/groups"
          className="btn btn-sm btn-primary"
        >
          Manage Groups
        </Link>
      </div>
    </div>
  );
}
