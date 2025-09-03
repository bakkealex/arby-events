import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/shared/AdminHeader";
import GroupsTable from "@/components/admin/group/GroupsTable";

export default async function AdminGroupsPage() {
  // Admin-only access
  try {
    await requireRole(UserRole.ADMIN);
  } catch {
    redirect("/auth/signin");
  }

  // Fetch all groups with creator info, member count, and event count
  const groupsRaw = await prisma.group.findMany({
    include: {
      creator: { select: { id: true, name: true, email: true } },
      userGroups: true,
      events: true,
      _count: {
        select: {
          userGroups: true,
          events: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transform groups to match client-side expectations
  const groups = groupsRaw.map(group => ({
    ...group,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    // Keep the _count from Prisma
    // Keep the userGroups and events arrays for filtering logic if needed
    userGroups: group.userGroups.map(ug => ({
      ...ug,
      joinedAt:
        ug.joinedAt instanceof Date ? ug.joinedAt.toISOString() : ug.joinedAt,
    })),
    events: group.events.map(ev => ({
      ...ev,
      startDate:
        ev.startDate instanceof Date
          ? ev.startDate.toISOString()
          : ev.startDate,
      endDate:
        ev.endDate instanceof Date ? ev.endDate.toISOString() : ev.endDate,
      createdAt:
        ev.createdAt instanceof Date
          ? ev.createdAt.toISOString()
          : ev.createdAt,
      updatedAt:
        ev.updatedAt instanceof Date
          ? ev.updatedAt.toISOString()
          : ev.updatedAt,
    })),
  }));

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Groups", current: true },
  ];

  return (
    <>
      <AdminHeader
        title="Group Management"
        description="Manage user groups and permissions"
        breadcrumbs={breadcrumbs}
      />
      <GroupsTable groups={groups} />
    </>
  );
}
