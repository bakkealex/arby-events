import { getCurrentUser } from "@/lib/auth-utils";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function getUserGroups(userId: string) {
  const userGroups = await prisma.userGroup.findMany({
    where: { userId },
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
            where: {
              startDate: {
                gte: new Date(),
              },
            },
            take: 3,
            orderBy: { startDate: "asc" },
            select: {
              id: true,
              title: true,
              startDate: true,
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return userGroups;
}

export default async function GroupsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const userGroups = await getUserGroups(user.userId);

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Groups
        </h1>
      </div>

      {/* My Groups */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-green-700 dark:text-green-400">
          Groups I&apos;m In
        </h2>
        {userGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userGroups.map(userGroup => (
              <div
                key={`${userGroup.group.id}-${userGroup.userId}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500 dark:border-green-400"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userGroup.group.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${userGroup.role === "ADMIN" ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}
                  >
                    {userGroup.role}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {userGroup.group.description || "No description"}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {userGroup.group._count.userGroups}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Members
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {userGroup.group._count.events}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Events
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                    Upcoming Events
                  </h4>
                  {userGroup.group.events.length > 0 ? (
                    <ul className="space-y-1">
                      {userGroup.group.events.map(
                        (event: {
                          id: string;
                          title: string;
                          startDate: Date | string;
                        }) => (
                          <li
                            key={event.id}
                            className="text-xs text-gray-600 dark:text-gray-300 truncate"
                          >
                            {event.title} -{" "}
                            {new Date(event.startDate).toLocaleDateString(
                              DEFAULT_LOCALE
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No upcoming events
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <a
                    href={`/groups/${userGroup.group.id}`}
                    className="flex-1 bg-blue-600 dark:bg-blue-500 text-white text-center py-2 px-3 rounded hover:bg-blue-700 dark:hover:bg-blue-600 text-sm transition-colors"
                  >
                    View Group
                  </a>
                  <a
                    href={`/groups/${userGroup.group.id}/events`}
                    className="flex-1 bg-purple-600 dark:bg-purple-500 text-white text-center py-2 px-3 rounded hover:bg-purple-700 dark:hover:bg-purple-600 text-sm transition-colors"
                  >
                    View Events
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You haven&apos;t joined any groups yet.
            </p>
            <a
              href="/groups/discover"
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Discover Groups
            </a>
          </div>
        )}
      </section>

      {/* Discover Groups Link */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
            Looking for New Groups?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Discover and join groups that match your interests
          </p>
          <a
            href="/groups/discover"
            className="inline-flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
          >
            Discover Groups
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
