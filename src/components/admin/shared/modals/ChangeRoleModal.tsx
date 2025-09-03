"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import useUserManagement from "@/hooks/useUserManagement";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { UserRole } from "@prisma/client";

interface ChangeRoleModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export default function ChangeRoleModal({
  open,
  onClose,
  user,
}: ChangeRoleModalProps) {
  const [newRole, setNewRole] = useState<UserRole>(user.role as UserRole);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const { loading, error, editUser, clearError } = useUserManagement();

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      setNewRole(user.role as UserRole);
      setSuccessMessage("");
      clearError();
    }
  }, [open, user, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newRole === user.role) {
      setSuccessMessage("No changes made - role is already set to " + newRole);
      return;
    }

    clearError();

    try {
      const result = await editUser({
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: newRole,
      });

      if (result) {
        setSuccessMessage(
          `Role changed from ${user.role} to ${newRole} successfully!`
        );
        router.refresh();

        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error changing user role:", error);
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Full platform access - can manage all users, groups, and events";
      case UserRole.USER:
        return "Standard user access - can join groups and subscribe to events";
      default:
        return "";
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case UserRole.USER:
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="Change User Role" size="md">
      <div className="space-y-4">
        {/* User Info */}
        <div className="bg-gray-50 rounded-md p-4 dark:bg-gray-700">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {user.name || user.email}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Current role:
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full border ${getRoleBadgeColor(user.role as UserRole)}`}
                >
                  {user.role}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Role Selection Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select new role:
            </label>

            <div className="space-y-3">
              {Object.values(UserRole).map(role => (
                <label
                  key={role}
                  className={`flex items-start space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${
                    newRole === role
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={newRole === role}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full border font-medium ${getRoleBadgeColor(role)}`}
                      >
                        {role}
                      </span>
                      {role === user.role && (
                        <span className="text-xs text-gray-500">(current)</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getRoleDescription(role)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Warning for Admin Role */}
          {newRole === UserRole.ADMIN && user.role !== UserRole.ADMIN && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Admin users have full access to all
                platform features, including the ability to manage other users
                and sensitive data.
              </p>
            </div>
          )}

          {error && <ErrorMessage message={error} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || newRole === user.role}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Changing..." : "Change Role"}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}
