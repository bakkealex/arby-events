import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/shared/AdminHeader";
import GroupDetailsLayout from "@/components/admin/group/GroupDetailsLayout";
import type { AdminGroupView } from "@/types";

export default async function AdminGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validate group ID
  if (!id) {
    redirect("/admin/groups");
  }

  // Admin-only access
  try {
    await requireRole(UserRole.ADMIN);
  } catch {
    redirect("/auth/signin");
  }

  // Fetch group with all related data
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      userGroups: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      events: {
        orderBy: { startDate: "asc" },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { eventSubscriptions: true } },
        },
      },
      _count: {
        select: {
          userGroups: true,
          events: true,
        },
      },
    },
  });

  // If group not found, redirect to groups list
  if (!group) {
    redirect("/admin/groups");
  }

  // Transform data for client
  const transformedGroup: AdminGroupView = {
    ...group,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    isHidden: false,
    memberCount: group._count.userGroups,
    eventCount: group._count.events,
    administrators: group.userGroups
      .filter(ug => ug.role === "ADMIN")
      .map(ug => ({
        id: ug.user.id,
        name: ug.user.name,
        email: ug.user.email,
        role: ug.role,
      })),
    userGroups: group.userGroups.map(ug => ({
      ...ug,
      joinedAt: ug.joinedAt.toISOString(),
    })),
    events: group.events.map(event => ({
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    })),
  };
  // Breadcrumbs
  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Groups", href: "/admin/groups" },
    { label: transformedGroup.name, current: true },
  ];

  return (
    <>
      <AdminHeader
        title={transformedGroup.name}
        description="Manage group details, members, and events"
        breadcrumbs={breadcrumbs}
      />
      <GroupDetailsLayout group={transformedGroup} />
    </>
  );
}
