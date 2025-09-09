import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getAvailableGroups(userId: string) {
  const availableGroups = await prisma.group.findMany({
    where: {
      userGroups: {
        none: {
          userId,
        },
      },
    },
    include: {
      _count: {
        select: {
          userGroups: true,
          events: true,
        },
      },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return availableGroups;
}

export default async function DiscoverGroupsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const availableGroups = await getAvailableGroups(user.userId);

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Discover Groups
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Find and join groups that interest you
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/groups"
            className="btn btn-secondary"
          >
            My Groups
          </Link>
        </div>
      </div>

      {/* Available Groups */}
      <section>
        {availableGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableGroups.map(group => (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500 dark:border-blue-400"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {group.name}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {group.description || "No description available"}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {group._count.userGroups}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Members
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {group._count.events}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Events
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/groups/${group.id}`}
                    className="flex-1 btn btn-sm btn-primary"
                  >
                    View Details
                  </Link>
                  <form
                    action={`/api/groups/${group.id}/join`}
                    method="POST"
                    className="flex-1"
                  >
                    <button
                      type="submit"
                      className="w-full btn btn-sm btn-success"
                    >
                      Request to Join
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Groups Available
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                There are no groups available to join at the moment, or
                you&apos;re already a member of all existing groups.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contact an administrator to request new groups be created.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Search and Filters - Future Enhancement */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
          Coming Soon
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Advanced search and filtering options to help you find the perfect
          groups based on your interests, location, and activity level.
        </p>
      </div>
    </div>
  );
}
