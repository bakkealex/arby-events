import { getCurrentUser } from "@/lib/auth-utils";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const authUser = await getCurrentUser();

  if (!authUser) {
    redirect("/auth/signin");
  }

  // Fetch detailed user data with relations
  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    include: {
      userGroups: {
        include: {
          group: true,
        },
      },
      eventSubscriptions: {
        include: {
          event: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Profile</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user.name || "Not provided"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Role
                </label>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded ${user.role === "ADMIN"
                    ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}
                >
                  {user.role}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Member Since
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString(DEFAULT_LOCALE)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/profile/edit"
                className="inline-flex btn btn-lg btn-primary"
              >
                Edit Profile
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {user.userGroups.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Groups Joined</p>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-100 dark:border-purple-800">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {user.eventSubscriptions.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Events Subscribed</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <a
                href="/events"
                className="btn btn-block btn-success"
              >
                View My Events
              </a>

              <a
                href="/groups"
                className="btn btn-block btn-purple"
              >
                View My Groups
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4">
          Account Management
        </h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            To be implemented.
          </p>
          <button className="btn btn-danger">
            Deactivate Account
          </button>
          <button className="btn btn-danger">
            Request Account Deletion
          </button>
        </div>
      </div>
    </div>
  );
}
