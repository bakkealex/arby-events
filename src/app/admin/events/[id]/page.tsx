import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AdminHeader from "@/components/admin/shared/AdminHeader";
import EventDetailsLayout from "@/components/admin/events/EventDetailsLayout";
import { getEvent } from "../actions";

interface EventDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function EventDetailsContent({
  event,
}: {
  event: {
    id: string;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
    groupId: string;
    createdBy: string;
    group: {
      id: string;
      name: string;
      description: string | null;
    };
    creator: {
      id: string;
      name: string | null;
      email: string;
    };
    _count: {
      eventSubscriptions: number;
    };
    eventSubscriptions: Array<{
      userId: string;
      subscribedAt: Date;
      user: {
        id: string;
        name: string | null;
        email: string;
        active: boolean;
      };
    }>;
  };
}) {
  return <EventDetailsLayout event={event} />;
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  // Admin-only access
  try {
    await requireRole(UserRole.ADMIN);
  } catch {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Events", href: "/admin/events" },
    { label: event.title, current: true },
  ];

  const eventDate = new Date(event.startDate).toLocaleDateString();
  const groupInfo = event.group ? `in ${event.group.name}` : "";
  const description = `Event on ${eventDate} ${groupInfo} • ${event._count?.eventSubscriptions || 0} subscribers`;

  return (
    <>
      <AdminHeader
        title={event.title}
        description={description}
        breadcrumbs={breadcrumbs}
      />
      <div className="p-6">
        <Suspense fallback={<LoadingSpinner />}>
          <EventDetailsContent event={event} />
        </Suspense>
      </div>
    </>
  );
}
