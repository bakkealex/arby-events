import { getCurrentUser } from "@/lib/auth-utils";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function getUserEvents(userId: string) {
  const subscriptions = await prisma.eventSubscription.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      event: {
        startDate: "asc",
      },
    },
  });

  const now = new Date();
  const upcomingEvents = subscriptions.filter(
    sub => new Date(sub.event.startDate) >= now
  );
  const pastEvents = subscriptions.filter(
    sub => new Date(sub.event.startDate) < now
  );

  return { upcomingEvents, pastEvents };
}

export default async function EventsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { upcomingEvents, pastEvents } = await getUserEvents(user.userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Events</h1>
        <a
          href="/groups"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Browse Groups
        </a>
      </div>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-green-700">
          Upcoming Events
        </h2>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(({ event }) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  <a
                    href={`/api/calendar/${event.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="Download Calendar"
                  >
                    📅 .ics
                  </a>
                </div>

                <p className="text-gray-600 mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-1 text-sm text-gray-700 mb-3">
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(event.startDate).toLocaleDateString(
                      DEFAULT_LOCALE
                    )}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date(event.startDate).toLocaleTimeString()}
                  </p>
                  {event.location && (
                    <p>
                      <strong>Location:</strong> {event.location}
                    </p>
                  )}
                  <p>
                    <strong>Group:</strong> {event.group.name}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    Subscribed
                  </span>
                  <form
                    action={`/api/events/${event.id}/unsubscribe`}
                    method="POST"
                  >
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Unsubscribe
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No upcoming events found.</p>
            <a
              href="/groups"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Join Groups to Find Events
            </a>
          </div>
        )}
      </section>

      {/* Past Events */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">
          Event History
        </h2>
        {pastEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map(({ event }) => (
              <div
                key={event.id}
                className="bg-gray-50 rounded-lg shadow-sm p-6 border-l-4 border-gray-400"
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  {event.title}
                </h3>

                <p className="text-gray-600 mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(event.startDate).toLocaleDateString(
                      DEFAULT_LOCALE
                    )}
                  </p>
                  <p>
                    <strong>Group:</strong> {event.group.name}
                  </p>
                </div>

                <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                  Completed
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No past events found.</p>
          </div>
        )}
      </section>
    </div>
  );
}
