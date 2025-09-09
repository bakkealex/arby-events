import { requireRole } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminHeader from "@/components/admin/shared/AdminHeader";
import GroupsTable from "@/components/admin/group/GroupsTable";

export default async function AdminGroupsPage() {
  // Admin-only access
  try {
    await requireRole(UserRole.ADMIN);
  } catch {
    redirect("/auth/signin");
  }

  // Get session for API call
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch groups using the API endpoint with admin parameters
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // For admin view, get all groups with hidden ones included
  const response = await fetch(`${baseUrl}/api/groups?limit=1000&include_hidden=true`, {
    headers: {
      "Content-Type": "application/json",
      // In Next.js 13+, we can pass the session via headers for internal API calls
      Authorization: `Bearer ${session.user.id}`,
    },
    cache: "no-store", // Always fetch fresh data for admin
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch groups: ${response.status}`);
  }

  const data = await response.json();
  const groups = data.groups || [];

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
