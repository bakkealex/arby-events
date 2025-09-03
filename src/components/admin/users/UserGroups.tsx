"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface UserGroupsProps {
  user: {
    userGroups: Array<{
      userId: string;
      groupId: string;
      role: string;
      joinedAt: string;
      group: {
        id: string;
        name: string;
        description: string | null;
      };
    }>;
  };
}

export default function UserGroups({ user }: UserGroupsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "ADMIN" | "MEMBER">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"name" | "joined" | "role">("joined");

  const filteredAndSortedGroups = useMemo(() => {
    const filtered = user.userGroups.filter(membership => {
      const matchesSearch =
        membership.group.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (membership.group.description?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      const matchesRole =
        roleFilter === "all" || membership.role === roleFilter;

      return matchesSearch && matchesRole;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.group.name.localeCompare(b.group.name);
        case "role":
          return a.role.localeCompare(b.role);
        case "joined":
        default:
          return (
            new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
          );
      }
    });
  }, [user.userGroups, searchTerm, roleFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Group Memberships
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage user&apos;s group memberships and roles
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
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
            <option value="joined">Join Date</option>
            <option value="name">Group Name</option>
            <option value="role">Role</option>
          </select>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedGroups.map(membership => (
              <tr
                key={membership.groupId}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4">
                  <div>
                    <Link
                      href={`/admin/groups/${membership.group.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {membership.group.name}
                    </Link>
                    {membership.group.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {membership.group.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${membership.role === "ADMIN"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                  >
                    {membership.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(membership.joinedAt).toLocaleDateString(
                    DEFAULT_LOCALE
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <Link
                    href={`/admin/groups/${membership.group.id}`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {filteredAndSortedGroups.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No group memberships found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
