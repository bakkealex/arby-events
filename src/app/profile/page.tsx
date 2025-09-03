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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.name || "Not provided"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded ${user.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {user.role}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Member Since
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString(DEFAULT_LOCALE)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/profile/edit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <p className="text-2xl font-bold text-blue-600">
                  {user.userGroups.length}
                </p>
                <p className="text-sm text-gray-600">Groups Joined</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded">
                <p className="text-2xl font-bold text-purple-600">
                  {user.eventSubscriptions.length}
                </p>
                <p className="text-sm text-gray-600">Events Subscribed</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <a
                href="/events"
                className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                View My Events
              </a>

              <a
                href="/groups"
                className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
              >
                View My Groups
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-4">
          Account Management
        </h2>
        <div className="space-y-2">
          <button className="block w-full md:w-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Deactivate Account
          </button>
          <button className="block w-full md:w-auto bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900">
            Request Account Deletion
          </button>
        </div>
      </div>
    </div>
  );
}
