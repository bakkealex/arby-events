"use client";
import { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import EditGroupModal from "../shared/modals/EditGroupModal";
import DeleteGroupModal from "../shared/modals/DeleteGroupModal";
import AddMemberModal from "../shared/modals/AddMemberModal";
import SendNotificationModal from "../shared/modals/SendNotificationModal";

interface GroupQuickActionsProps {
  group: {
    id: string;
    name: string;
    description?: string | null | undefined;
    _count?: {
      userGroups: number;
      events: number;
    };
  };
}

export default function GroupQuickActions({ group }: GroupQuickActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Safe access to _count with fallbacks - using correct property names
  const memberCount = group._count?.userGroups ?? 0;
  const eventCount = group._count?.events ?? 0;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <div className="space-y-3">
          {/* Edit Group */}
          <button
            onClick={() => setShowEditModal(true)}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-3" />
            Edit Group
          </button>

          {/* Add Member */}
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30 transition-colors"
          >
            <UserPlusIcon className="h-4 w-4 mr-3" />
            Add Member
          </button>

          {/* Send Notification */}
          <button
            onClick={() => setShowNotificationModal(true)}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/30 transition-colors"
          >
            <BellIcon className="h-4 w-4 mr-3" />
            Send Notification
          </button>

          {/* Delete Group */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/30 transition-colors"
          >
            <TrashIcon className="h-4 w-4 mr-3" />
            Delete Group
          </button>
        </div>

        {/* Group Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{memberCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Members
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{eventCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditGroupModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        group={{
          id: group.id,
          name: group.name,
          description: group.description ?? null,
        }}
      />

      <DeleteGroupModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        group={{
          id: group.id,
          name: group.name,
          _count: {
            members: memberCount,
            events: eventCount,
          },
        }}
      />

      <AddMemberModal
        open={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        groupId={group.id}
      />

      <SendNotificationModal
        open={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        groupId={group.id}
      />
    </>
  );
}
