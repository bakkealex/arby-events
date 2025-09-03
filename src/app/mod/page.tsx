import { getCurrentUser } from "@/lib/auth-utils";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GroupRole } from "@prisma/client";
import Link from "next/link";

async function getModeratorData(userId: string) {
  // Get groups where user is admin
  const adminGroups = await prisma.userGroup.findMany({
    where: {
      userId,
      role: GroupRole.ADMIN,
    },
    include: {
      group: {
        include: {
          _count: {
            select: {
              userGroups: true,
              events: true,
            },
          },
          events: {
            take: 3,
            orderBy: { startDate: "desc" },
            select: {
              id: true,
              title: true,
              startDate: true,
            },
          },
        },
      },
    },
  });

  return { adminGroups };
}

export default async function ModeratorPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { adminGroups } = await getModeratorData(user.userId);

  // Check if user is admin of any groups or platform admin
  if (user.role !== "ADMIN" && adminGroups.length === 0) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Group Administrator Dashboard</h1>

      {user.role === "ADMIN" && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-blue-800">
            <strong>Platform Admin:</strong> You have full access to all groups
            and can manage any group.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {adminGroups.map(({ group }) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {group.name}
              </h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                Admin
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">
              {group.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {group._count.userGroups}
                </p>
                <p className="text-sm text-gray-500">Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {group._count.events}
                </p>
                <p className="text-sm text-gray-500">Events</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Recent Events</h4>
              {group.events.length > 0 ? (
                <ul className="space-y-1">
                  {group.events.map(event => (
                    <li
                      key={event.id}
                      className="text-sm text-gray-600 truncate"
                    >
                      {event.title} -{" "}
                      {new Date(event.startDate).toLocaleDateString(
                        DEFAULT_LOCALE
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No recent events</p>
              )}
            </div>

            <div className="flex space-x-2">
              <a
                href={`/mod/groups/${group.id}`}
                className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 text-sm"
              >
                Manage Group
              </a>
              <a
                href={`/mod/groups/${group.id}/events`}
                className="flex-1 bg-purple-600 text-white text-center py-2 px-4 rounded hover:bg-purple-700 text-sm"
              >
                Manage Events
              </a>
            </div>
          </div>
        ))}
      </div>

      {adminGroups.length === 0 && user.role === "ADMIN" && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Groups Found
          </h3>
          <p className="text-gray-600 mb-4">
            As a platform admin, you can access any group or create a new one.
          </p>
          <Link
            href="/admin/groups"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Admin Panel
          </Link>
        </div>
      )}

      <div className="mt-8 flex justify-center space-x-4">
        <a
          href="/mod/statistics"
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          View Statistics
        </a>
        <a
          href="/mod/notifications"
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Send Notifications
        </a>
      </div>
    </div>
  );
}
