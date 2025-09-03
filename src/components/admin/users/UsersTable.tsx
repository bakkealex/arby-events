"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/constants";
import CreateUserModal from "../shared/modals/CreateUserModal";
import type { AdminUserView } from "@/types";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface UsersTableProps {
  users: AdminUserView[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "admin" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "all"
  >("active");
  const [sortBy, setSortBy] = useState<"name" | "created" | "groups" | "role">(
    "created"
  );

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch =
        (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "admin" && user.role === "ADMIN") ||
        (filterBy === "user" && user.role !== "ADMIN");

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.active !== false) ||
        (statusFilter === "inactive" && user.active === false);

      return matchesSearch && matchesFilter && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || a.email).localeCompare(b.name || b.email);
        case "groups":
          return (b._count?.userGroups || 0) - (a._count?.userGroups || 0);
        case "role":
          return a.role.localeCompare(b.role);
        case "created":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  }, [users, searchTerm, filterBy, statusFilter, sortBy]);

  const activeUsers = users.filter(u => u.active !== false);
  const inactiveUsers = users.filter(u => u.active === false);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Users
        </h1>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          onClick={() => setModalOpen(true)}
        >
          Create User
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-green-600">
            {activeUsers.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Users
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-red-600">
            {inactiveUsers.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Inactive Users
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-blue-600">
            {activeUsers.filter(u => u.role === "ADMIN").length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Admins
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-yellow-600">
            {activeUsers.reduce(
              (sum, u) => sum + (u._count?.userGroups || 0),
              0
            )}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Group Memberships
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role Filter
            </label>
            <select
              value={filterBy}
              onChange={e =>
                setFilterBy(e.target.value as "all" | "admin" | "user")
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Regular Users</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as "active" | "inactive" | "all")
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="all">All Users</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e =>
                setSortBy(
                  e.target.value as "name" | "created" | "groups" | "role"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="created">Created Date</option>
              <option value="name">Name</option>
              <option value="groups">Group Count</option>
              <option value="role">Role</option>
            </select>
          </div>
        </div>

        {/* Quick Status Toggle */}
        <div className="mt-4 flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick toggle:
          </span>
          <button
            onClick={() =>
              setStatusFilter(statusFilter === "active" ? "all" : "active")
            }
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === "active"
                ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            {statusFilter === "active" ? "Show All" : "Active Only"}
          </button>
          {inactiveUsers.length > 0 && (
            <button
              onClick={() =>
                setStatusFilter(
                  statusFilter === "inactive" ? "active" : "inactive"
                )
              }
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === "inactive"
                  ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              <EyeSlashIcon className="h-3 w-3 mr-1" />
              {statusFilter === "inactive"
                ? "Hide Inactive"
                : `Show Inactive (${inactiveUsers.length})`}
            </button>
          )}
        </div>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredAndSortedUsers.length} of {users.length} users
          {statusFilter === "active" && inactiveUsers.length > 0 && (
            <span className="ml-2 text-gray-500">
              ({inactiveUsers.length} inactive users hidden)
            </span>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Account Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Groups
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
            {filteredAndSortedUsers.map(user => (
              <tr
                key={user.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  user.active === false ? "opacity-60" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <div
                    className={`text-sm font-medium ${
                      user.active === false
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {user.name || "No name"}
                    {user.active === false && (
                      <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                        (Deactivated)
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className={`px-6 py-4 text-sm ${
                    user.active === false
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    {/* Account Status */}
                    <span
                      className={`px-2 py-1 text-xs rounded-full w-fit ${
                        user.accountStatus === "APPROVED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : user.accountStatus === "PENDING"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            : user.accountStatus === "SUSPENDED"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      }`}
                    >
                      {user.accountStatus || "UNKNOWN"}
                    </span>
                    {/* Active/Inactive Status */}
                    <span
                      className={`px-2 py-1 text-xs rounded-full w-fit ${
                        user.active !== false
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      }`}
                    >
                      {user.active !== false ? "Active" : "Inactive"}
                    </span>
                    {/* Email Verification Status */}
                    {user.emailVerified ? (
                      <span className="px-2 py-1 text-xs rounded-full w-fit bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Email Verified
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full w-fit bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Email Unverified
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td
                  className={`px-6 py-4 text-sm ${
                    user.active === false
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {user._count?.userGroups ?? 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString(DEFAULT_LOCALE)}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAndSortedUsers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No users found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <CreateUserModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
