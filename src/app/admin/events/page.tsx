import { Suspense } from "react";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AdminHeader from "@/components/admin/shared/AdminHeader";
import EventsTable from "@/components/admin/events/EventsTable";
import EventStatsCards from "@/components/admin/events/EventStatsCards";
import EventFilters from "@/components/admin/events/EventFilters";
import {
  getEvents,
  getEventStats,
  getEventCounts,
  getGroups,
  EventFilters as EventFiltersType,
} from "./actions";

interface EventsContentProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function EventsContent({ searchParams }: EventsContentProps) {
  // Parse search params into filters
  const filters: EventFiltersType = {
    time: (searchParams.time as "upcoming" | "past" | "all") || "upcoming",
    groups: searchParams.groups
      ? (searchParams.groups as string).split(",")
      : [],
    search: (searchParams.search as string) || "",
    sort: (searchParams.sort as EventFiltersType["sort"]) || "date-desc",
    page: searchParams.page ? parseInt(searchParams.page as string, 10) : 1,
    limit: 50,
  };

  const [eventsData, stats, counts, groups] = await Promise.all([
    getEvents(filters),
    getEventStats(),
    getEventCounts(),
    getGroups(),
  ]);

  return (
    <>
      <EventStatsCards stats={stats} />
      <EventFilters groups={groups} totalCounts={counts} />
      <EventsTable
        events={eventsData.events}
        pagination={eventsData.pagination}
      />
    </>
  );
}

interface AdminEventsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminEventsPage({
  searchParams,
}: AdminEventsPageProps) {
  // Admin-only access
  try {
    await requireRole(UserRole.ADMIN);
  } catch {
    redirect("/auth/signin");
  }

  const resolvedSearchParams = await searchParams;

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Events", current: true },
  ];

  return (
    <>
      <AdminHeader
        title="Event Management"
        description="Manage all events on the platform"
        breadcrumbs={breadcrumbs}
      />
      <div className="p-6">
        <Suspense fallback={<LoadingSpinner />}>
          <EventsContent searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </>
  );
}
