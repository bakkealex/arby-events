"use client";
import { useState, useMemo } from "react";
import { DEFAULT_LOCALE } from "@/lib/constants";
import type { AdminGroupView } from "@/types";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import AddMemberModal from "@/components/admin/shared/modals/AddMemberModal";
import ManageMemberModal from "@/components/admin/shared/modals/ManageMemberModal";

interface GroupMembersProps {
  group: AdminGroupView;
}

export default function GroupMembers({ group }: GroupMembersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "ADMIN" | "MEMBER">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"name" | "joined" | "role">("joined");
  const [showAddModal, setShowAddModal] = useState(false);
  const [managingMember, setManagingMember] = useState<any>(null);

  const filteredAndSortedMembers = useMemo(() => {
    const filtered = (group.userGroups ?? []).filter(member => {
      const matchesSearch =
        member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || member.role === roleFilter;

      return matchesSearch && matchesRole;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          const nameA = a.user?.name || a.user?.email || "";
          const nameB = b.user?.name || b.user?.email || "";
          return nameA.localeCompare(nameB);
        case "role":
          return a.role.localeCompare(b.role);
        case "joined":
        default:
          return (
            new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
          );
      }
    });
  }, [group.userGroups, searchTerm, roleFilter, sortBy]);

  const members = group.userGroups ?? [];
  const memberStats = {
    total: members.length,
    admins: members.filter(m => m.role === "ADMIN").length,
    members: members.filter(m => m.role === "MEMBER").length,
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header and Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Group Members
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage member roles and permissions
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Add Member
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {memberStats.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Members
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {memberStats.admins}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Administrators
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {memberStats.members}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Regular Members
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={roleFilter}
              onChange={e =>
                setRoleFilter(e.target.value as "all" | "ADMIN" | "MEMBER")
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Administrators</option>
              <option value="MEMBER">Members</option>
            </select>
            <select
              value={sortBy}
              onChange={e =>
                setSortBy(e.target.value as "name" | "joined" | "role")
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="joined">Sort by Join Date</option>
              <option value="name">Sort by Name</option>
              <option value="role">Sort by Role</option>
            </select>
          </div>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedMembers.length} of {members.length}{" "}
            members
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedMembers.map(member => (
                <tr
                  key={member.userId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {(member.user?.name ||
                            member.user?.email ||
                            "U")[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.user?.name || "No name"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {member.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.role === "ADMIN"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(member.joinedAt).toLocaleDateString(
                      DEFAULT_LOCALE
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => setManagingMember(member)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAndSortedMembers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No members found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        groupId={group.id}
      />
      <ManageMemberModal
        open={!!managingMember}
        onClose={() => setManagingMember(null)}
        member={managingMember}
        groupId={group.id}
      />
    </>
  );
}
