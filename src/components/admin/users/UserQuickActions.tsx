"use client";
import { useState } from "react";
import {
  PencilIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import EditUserModal from "../shared/modals/EditUserModal";
import DeactivateUserModal from "../shared/modals/DeactivateUserModal";
import ActivateUserModal from "../shared/modals/ActivateUserModal";
import ChangeRoleModal from "../shared/modals/ChangeRoleModal";

interface UserQuickActionsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    active?: boolean;
  };
}

export default function UserQuickActions({ user }: UserQuickActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);

  const isUserActive = user.active !== false;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <div className="space-y-3">
          {/* Edit User */}
          <button
            onClick={() => setShowEditModal(true)}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-3" />
            Edit User
          </button>

          {/* Change Role */}
          <button
            onClick={() => setShowChangeRoleModal(true)}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30 transition-colors"
          >
            <ShieldCheckIcon className="h-4 w-4 mr-3" />
            Change Role
          </button>

          {/* Activate/Deactivate User */}
          {isUserActive ? (
            <button
              onClick={() => setShowDeactivateModal(true)}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/30 transition-colors"
            >
              <ExclamationTriangleIcon className="h-4 w-4 mr-3" />
              Deactivate User
            </button>
          ) : (
            <button
              onClick={() => setShowActivateModal(true)}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/30 transition-colors"
            >
              <CheckCircleIcon className="h-4 w-4 mr-3" />
              Activate User
            </button>
          )}
        </div>

        {/* Status Indicator */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Current Status:
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                isUserActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {isUserActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditUserModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
      />

      <ChangeRoleModal
        open={showChangeRoleModal}
        onClose={() => setShowChangeRoleModal(false)}
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
    </>
  );
}
