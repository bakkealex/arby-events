"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/constants";
import type { AdminGroupView } from "@/types";
import DeleteGroupModal from "@/components/admin/shared/modals/DeleteGroupModal";
import EditGroupModal from "@/components/admin/shared/modals/EditGroupModal";
import ExportDataModal from "@/components/admin/shared/modals/ExportDataModal";
import {
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface GroupSettingsProps {
  group: AdminGroupView;
}

export default function GroupSettings({ group }: GroupSettingsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleUpdateVisibility = async (isPublic: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        throw new Error("Failed to update group visibility");
      }
    } catch (error) {
      console.error("Error updating group:", error);
      alert("Failed to update group settings. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Basic Settings
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Group Information
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update group name and description
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Export Group Data
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Group Name
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {group.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {group.description || "No description"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(group.createdAt).toLocaleDateString(
                      DEFAULT_LOCALE
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(
                      group.updatedAt || group.createdAt
                    ).toLocaleDateString(DEFAULT_LOCALE)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Group Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Group Statistics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border dark:border-blue-800">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {group._count?.userGroups ?? group.memberCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Members
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border dark:border-green-800">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {group._count?.events ?? group.eventCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Events
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border dark:border-purple-800">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {group.userGroups?.filter(m => m.role === "ADMIN").length ?? 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Administrators
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border dark:border-yellow-800">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {group.events?.filter(e => new Date(e.endDate) >= new Date())
                  .length ?? 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upcoming Events
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Advanced Settings
          </h3>

          <div className="space-y-6">
            {/* Group Visibility */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Group Visibility
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Control who can see and join this group
                    </p>
                  </div>
                </div>
                <select
                  disabled={isUpdating}
                  onChange={e =>
                    handleUpdateVisibility(e.target.value === "public")
                  }
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>

            {/* Group ID */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Group ID
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Unique identifier for this group
                  </p>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded mt-1 inline-block">
                    {group.id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
            Danger Zone
          </h3>

          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                    Delete Group
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Permanently delete this group and all associated data. This
                    action cannot be undone.
                  </p>
                  <ul className="text-sm text-red-600 dark:text-red-400 mt-2 space-y-1">
                    <li>
                      • All {group._count?.events ?? group.eventCount} events
                      will be deleted
                    </li>
                    <li>
                      • All {group._count?.userGroups ?? group.memberCount}{" "}
                      members will lose access
                    </li>
                    <li>• All group data and history will be lost</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Group
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditGroupModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        group={group}
      />

      <DeleteGroupModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        group={group}
      />

      <ExportDataModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        groupId={group.id}
      />
    </>
  );
}
