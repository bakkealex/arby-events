"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/constants";
import CreateGroupModal from "../shared/modals/CreateGroupModal";
import { UsersIcon, CalendarIcon } from "@heroicons/react/24/outline";

interface Group {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  createdBy: string;
  creator?: {
    name: string | null;
    email: string;
  };
  _count: {
    userGroups: number;
    events: number;
  };
}

interface GroupsTableProps {
  groups: Group[];
}

export default function GroupsTable({ groups }: GroupsTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "created" | "members" | "events"
  >("created");

  const filteredAndSortedGroups = useMemo(() => {
    const filtered = groups.filter(
      group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (group.creator?.name || group.creator?.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "members":
          return (b._count?.userGroups || 0) - (a._count?.userGroups || 0);
        case "events":
          return (b._count?.events || 0) - (a._count?.events || 0);
        case "created":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  }, [groups, searchTerm, sortBy]);

  // Safe calculations with fallbacks
  const totalMembers = groups.reduce(
    (sum, g) => sum + (g._count?.userGroups || 0),
    0
  );
  const totalEvents = groups.reduce(
    (sum, g) => sum + (g._count?.events || 0),
    0
  );
  const avgMembersPerGroup =
    groups.length > 0 ? Math.round(totalMembers / groups.length) : 0;

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Groups
        </h1>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          onClick={() => setModalOpen(true)}
        >
          Create Group
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-blue-600">{groups.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Groups
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-green-600">{totalMembers}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Members
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-purple-600">{totalEvents}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Events
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-yellow-600">
            {avgMembersPerGroup}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Avg Members/Group
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search groups by name, description, or creator..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e =>
                setSortBy(
                  e.target.value as "name" | "created" | "members" | "events"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="created">Created Date</option>
              <option value="name">Name</option>
              <option value="members">Member Count</option>
              <option value="events">Event Count</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredAndSortedGroups.length} of {groups.length} groups
        </div>
      </div>

      {/* Groups Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Creator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Events
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedGroups.map(group => (
              <tr
                key={group.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {group.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {group.description || (
                      <span className="italic text-gray-400">
                        No description
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {group.creator?.name || group.creator?.email || "Unknown"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <UsersIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {group._count?.userGroups || 0}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {group._count?.events || 0}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(group.createdAt).toLocaleDateString(DEFAULT_LOCALE)}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/groups/${group.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAndSortedGroups.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No groups found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <CreateGroupModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
