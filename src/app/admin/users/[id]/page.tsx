import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/constants";
import AdminHeader from "@/components/admin/shared/AdminHeader";
import UserDetailsLayout from "@/components/admin/users/UserDetailsLayout";

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validate user ID
  if (!id) {
    redirect("/admin/users");
  }

  // Admin-only access
  try {
    await requireRole(UserRole.ADMIN);
  } catch {
    redirect("/auth/signin");
  }

  // Fetch user with all related data
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      userGroups: {
        include: {
          group: { select: { id: true, name: true, description: true } },
        },
        orderBy: { joinedAt: "desc" },
      },
      createdEvents: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          group: { select: { id: true, name: true } },
        },
        orderBy: { startDate: "desc" },
        take: 10,
      },
      eventSubscriptions: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              group: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { subscribedAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          userGroups: true,
          createdEvents: true,
          eventSubscriptions: true,
        },
      },
    },
  });

  // If user not found, redirect to users list
  if (!user) {
    redirect("/admin/users");
  }

  // Transform data for client with explicit active property handling
  const transformedUser = {
    ...user,
    // Ensure active is always a boolean, defaulting to true if null/undefined
    active: user.active ?? true,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    userGroups: user.userGroups.map(ug => ({
      ...ug,
      joinedAt: ug.joinedAt.toISOString(),
    })),
    createdEvents: user.createdEvents.map(event => ({
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
    })),
    eventSubscriptions: user.eventSubscriptions.map(sub => ({
      ...sub,
      subscribedAt: sub.subscribedAt.toISOString(),
      event: {
        ...sub.event,
        startDate: sub.event.startDate.toISOString(),
        endDate: sub.event.endDate.toISOString(),
      },
    })),
  };

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: transformedUser.name || transformedUser.email, current: true },
  ];

  const statusText = transformedUser.active ? "Active" : "Inactive";
  const memberSinceText = `${statusText} • Member since ${new Date(transformedUser.createdAt).toLocaleDateString(DEFAULT_LOCALE)}`;

  return (
    <>
      <AdminHeader
        title={transformedUser.name || transformedUser.email}
        description={`User role: ${transformedUser.role} • ${memberSinceText}`}
        breadcrumbs={breadcrumbs}
      />
      <UserDetailsLayout user={transformedUser} />
    </>
  );
}
