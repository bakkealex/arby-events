import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Welcome to your event management dashboard
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-blue-600 dark:text-blue-400 text-2xl">
                      👥
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      My Groups
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      View and manage your groups
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href="/groups"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
                  >
                    View Groups →
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-blue-600 dark:text-blue-400 text-2xl">
                      📅
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      My Events
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      View upcoming events
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href="/events"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
                  >
                    View Events →
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-blue-600 dark:text-blue-400 text-2xl">
                      👤
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      My Profile
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manage your profile information
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href="/profile"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
                  📝
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No recent activity
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Join some groups and subscribe to events to see activity here.
                </p>
                <div className="mt-6">
                  <Link
                    href="/groups"
                    className="btn btn-primary"
                  >
                    Browse Groups
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
