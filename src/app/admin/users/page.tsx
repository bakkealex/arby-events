import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/shared/AdminHeader";
import UsersTable from "@/components/admin/users/UsersTable";
import PendingUsersList from "@/components/admin/users/PendingUsersList";

export default async function AdminUsersPage() {
  // Admin-only access
  try {
    await requireRole(UserRole.ADMIN);
  } catch {
    redirect("/auth/signin");
  }
  // TODO: Have it fetch it from the API instead.
  // Fetch all users with their roles, groups, and counts
  const usersRaw = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      active: true,
      role: true,
      createdAt: true,
      accountStatus: true,
      emailVerified: true,
      gdprConsentDate: true,
      approvedBy: true,
      approvedAt: true,
      userGroups: {
        include: {
          group: { select: { id: true, name: true } },
        },
      },
      _count: {
        select: {
          userGroups: true,
        },
      },
      // Do not include password or updatedAt
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch pending users for admin approval
  const pendingUsersRaw = await prisma.user.findMany({
    where: { accountStatus: "PENDING" },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      gdprConsentDate: true,
      emailVerified: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Map userGroups to flat array of { id, name } and format dates
  const users = usersRaw.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    gdprConsentDate: user.gdprConsentDate?.toISOString() || null,
    emailVerified: user.emailVerified?.toISOString() || null,
    approvedAt: user.approvedAt?.toISOString() || null,
    userGroups: user.userGroups.map(ug => ({
      id: ug.group.id,
      name: ug.group.name,
    })),
  }));

  // Format pending users dates
  const pendingUsers = pendingUsersRaw.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    gdprConsentDate: user.gdprConsentDate?.toISOString() || null,
    emailVerified: user.emailVerified?.toISOString() || null,
  }));

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Users", current: true },
  ];

  return (
    <>
      <AdminHeader
        title="User Management"
        description="Manage users and permissions"
        breadcrumbs={breadcrumbs}
      />
      <div className="space-y-6">
        <PendingUsersList pendingUsers={pendingUsers} />
        <UsersTable users={users} />
      </div>
    </>
  );
}
