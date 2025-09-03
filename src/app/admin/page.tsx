import { requireRole } from "@/lib/auth-utils";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/shared/AdminHeader";
import GroupsOverviewCard from "@/components/admin/dashboard/GroupsOverviewCard";

async function getAdminStats() {
  const [userCount, groupCount, eventCount, recentUsers, groupStats] =
    await Promise.all([
      prisma.user.count(),
      prisma.group.count(),
      prisma.event.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
        },
      }),
      // Enhanced group statistics
      prisma.group.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              userGroups: true,
              events: true,
            },
          },
        },
      }),
    ]);

  // Calculate additional group metrics
  const [totalMembers, activeGroups, groupsWithEvents] = await Promise.all([
    prisma.userGroup.count(),
    prisma.group.count({
      where: {
        events: {
          some: {
            startDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Groups with events in last 30 days
            },
          },
        },
      },
    }),
    prisma.group.count({
      where: {
        events: {
          some: {},
        },
      },
    }),
  ]);

  return {
    userCount,
    groupCount,
    eventCount,
    recentUsers,
    groupStats: {
      totalGroups: groupCount,
      activeGroups,
      groupsWithEvents,
      totalMembers,
      recentGroups: groupStats.map(group => ({
        ...group,
        createdAt: group.createdAt.toISOString(),
      })),
    },
  };
}

export default async function AdminPage() {
  try {
    await requireRole(UserRole.ADMIN);
  } catch {
    redirect("/auth/signin");
  }

  const stats = await getAdminStats();

  // Breadcrumbs
  const breadcrumbs = [{ label: "Admin Dashboard", current: true }];

  return (
    <>
      <AdminHeader
        title="Admin Dashboard"
        description="Manage users, groups, and events"
        breadcrumbs={breadcrumbs}
      />
      <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        {/* Top Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500 dark:border-blue-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.userCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Platform members
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500 dark:border-green-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Groups
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.groupCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Active communities
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-500 dark:border-purple-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Events
            </h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.eventCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              All time events
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Group Management Card */}
          <GroupsOverviewCard stats={stats.groupStats} />

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/admin/users"
                className="flex items-center px-4 py-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Manage Users
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View and manage user accounts
                  </p>
                </div>
              </Link>
              <Link
                href="/admin/groups"
                className="flex items-center px-4 py-3 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Manage Groups
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Create and manage groups
                  </p>
                </div>
              </Link>
              <Link
                href="/admin/events"
                className="flex items-center px-4 py-3 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Manage Events
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Oversee platform events
                  </p>
                </div>
              </Link>
              <a
                href="/admin/settings"
                className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gray-600 dark:bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Platform Settings
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Configure platform options
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Recent Users - Keep existing but style consistently */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow lg:col-span-2 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Recent Users
            </h2>
            <div className="space-y-3">
              {stats.recentUsers.map(user => (
                <div
                  key={user.id}
                  className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.name || "No name"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${user.role === "ADMIN" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" : "bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200"}`}
                    >
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(user.createdAt).toLocaleDateString(
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
    </>
  );
}
