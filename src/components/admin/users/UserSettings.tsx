"use client";
import { useState } from "react";
import { DEFAULT_LOCALE } from "@/lib/constants";
import {
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import EditUserModal from "@/components/admin/shared/modals/EditUserModal";
import DeactivateUserModal from "@/components/admin/shared/modals/DeactivateUserModal";
import ChangeRoleModal from "@/components/admin/shared/modals/ChangeRoleModal";
import ActivateUserModal from "@/components/admin/shared/modals/ActivateUserModal";

interface UserSettingsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    active?: boolean;
    _count: {
      userGroups: number;
      createdEvents: number;
      eventSubscriptions: number;
    };
  };
}

export default function UserSettings({ user }: UserSettingsProps) {
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);

  const isUserActive = user.active !== false;

  return (
    <>
      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Basic Settings
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  User Information
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update user name, email, and role
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {user.name || "No name"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {user.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Role
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {user.role}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </dt>
                  <dd className="text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        isUserActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {isUserActive ? "Active" : "Inactive"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString(
                      DEFAULT_LOCALE
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {new Date(user.updatedAt).toLocaleDateString(
                      DEFAULT_LOCALE
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            User Statistics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {user._count.userGroups}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Group Memberships
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {user._count.createdEvents}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Created Events
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg dark:bg-purple-900/20">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {user._count.eventSubscriptions}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Event Subscriptions
              </p>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Account Management
          </h3>

          <div className="space-y-4">
            {/* User ID */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    User ID
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Unique identifier for this user
                  </p>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-1 inline-block">
                    {user.id}
                  </code>
                </div>
              </div>
            </div>

            {/* Role Management */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Role Management
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Change user role and permissions
                  </p>
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === "ADMIN"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      Current: {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowChangeRoleModal(true)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Change Role
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status Management */}
        <div
          className={`bg-white rounded-lg shadow p-6 border-l-4 dark:bg-gray-800 ${
            isUserActive ? "border-red-500" : "border-green-500"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              isUserActive ? "text-red-600" : "text-green-600"
            }`}
          >
            {isUserActive ? "Danger Zone" : "Account Recovery"}
          </h3>

          <div className="space-y-4">
            {/* Activate/Deactivate User */}
            <div
              className={`border rounded-md p-4 ${
                isUserActive
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              }`}
            >
              <div className="flex items-start space-x-3">
                {isUserActive ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4
                    className={`text-sm font-medium ${
                      isUserActive
                        ? "text-red-800 dark:text-red-200"
                        : "text-green-800 dark:text-green-200"
                    }`}
                  >
                    {isUserActive ? "Deactivate User" : "Activate User"}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      isUserActive
                        ? "text-red-700 dark:text-red-300"
                        : "text-green-700 dark:text-green-300"
                    }`}
                  >
                    {isUserActive
                      ? "Temporarily disable this user account. The user will not be able to log in."
                      : "Restore access to this user account. The user will be able to log in again."}
                  </p>
                </div>
                <button
                  onClick={() =>
                    isUserActive
                      ? setShowDeactivateModal(true)
                      : setShowActivateModal(true)
                  }
                  className={`px-3 py-2 text-white text-sm rounded-md transition-colors ${
                    isUserActive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isUserActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>

            {/* Delete User - Only show for active users or as a separate dangerous action */}
            {isUserActive && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div className="flex items-start space-x-3">
                  <TrashIcon className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Delete User
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Permanently delete this user and all associated data. This
                      action cannot be undone.
                    </p>
                  </div>
                  <button
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors opacity-50 cursor-not-allowed"
                    disabled
                  >
                    Delete (Coming Soon)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditUserModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
      />

      <DeactivateUserModal
        open={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        user={user}
      />

      <ActivateUserModal
        open={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        user={user}
      />

      <ChangeRoleModal
        open={showChangeRoleModal}
        onClose={() => setShowChangeRoleModal(false)}
        user={user}
      />
    </>
  );
}
