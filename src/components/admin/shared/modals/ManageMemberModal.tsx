"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/constants";
import BaseModal from "./BaseModal";
import {
  ExclamationTriangleIcon,
  UserMinusIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface Member {
  userId: string;
  groupId: string;
  role: string;
  joinedAt: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    role?: string;
  };
}

interface ManageMemberModalProps {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  groupId: string;
}

export default function ManageMemberModal({
  open,
  onClose,
  member,
  groupId,
}: ManageMemberModalProps) {
  const [activeAction, setActiveAction] = useState<
    "view" | "edit" | "remove" | "promote"
  >("view");
  const [newRole, setNewRole] = useState(member?.role || "MEMBER");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const router = useRouter();

  if (!member) return null;

  const handleRoleChange = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.userId, role: newRole }),
      });

      if (response.ok) {
        router.refresh();
        onClose();
        setActiveAction("view");
      } else {
        throw new Error("Failed to update member role");
      }
    } catch (error) {
      console.error("Error updating member role:", error);
      alert("Failed to update member role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/groups/${groupId}/members/${member.userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        router.refresh();
        onClose();
        setActiveAction("view");
        setConfirmRemoval(false);
      } else {
        throw new Error("Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeAction) {
      case "view":
        return (
          <div className="space-y-6">
            {/* Member Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Member Information
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {member.user?.name || "No name set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {member.user?.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Group Role
                  </dt>
                  <dd className="text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${member.role === "ADMIN"
                          ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        }`}
                    >
                      {member.role}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Platform Role
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {member.user?.role || "USER"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Joined Date
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {new Date(member.joinedAt).toLocaleDateString(
                      DEFAULT_LOCALE
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Member ID
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono">
                    {member.userId}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveAction("edit")}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Change Role
              </button>
              <button
                onClick={() => setActiveAction("remove")}
                className="flex items-center justify-center px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                <UserMinusIcon className="h-4 w-4 mr-2" />
                Remove Member
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        );

      case "edit":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-2">
                Change Member Role
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Update {member.user?.name || member.user?.email}&apos;s role in this
                group.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select New Role
              </label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Group Administrator</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Group Administrators can manage events, members, and group
                settings.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setActiveAction("view")}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={isLoading || newRole === member.role}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Updating..." : "Update Role"}
              </button>
            </div>
          </div>
        );

      case "remove":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Remove Member?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to remove{" "}
                  {member.user?.name || member.user?.email} from this group?
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>This action will:</strong>
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                <li>• Remove the member from this group</li>
                <li>• Cancel their subscriptions to group events</li>
                <li>• Revoke their access to group resources</li>
                <li>• This action can be reversed by re-adding them</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setActiveAction("view")}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-md hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Removing..." : "Remove Member"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={`Manage Member - ${member.user?.name || member.user?.email}`}
      size="lg"
      showCloseButton={activeAction === "view"}
    >
      {renderContent()}
    </BaseModal>
  );
}
