"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import useUserManagement from "@/hooks/useUserManagement";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { UserRole } from "@prisma/client";
import { Panel, ActionRow, Button, Badge } from "./components/Primitives";
import { Field } from "./components/Field";

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
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-700";
      case UserRole.USER:
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600";
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="Change User Role" size="md">
      <div className="space-y-4">
        {/* User Info */}
        <Panel>
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{user.name || user.email}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Current role: <Badge color={user.role === UserRole.ADMIN ? "yellow" : "blue"}>{user.role}</Badge>
              </p>
            </div>
          </div>
        </Panel>

        {/* Role Selection Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Select new role:">
            <div className="space-y-3">
              {Object.values(UserRole).map((role) => {
                const selected = newRole === role;
                return (
                  <label
                    key={role}
                    className={`flex items-start space-x-3 p-3 border rounded-md cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-700 ${selected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                      : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={newRole === role}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="mt-1 accent-blue-600 dark:accent-blue-400 focus:ring-blue-500 dark:focus:ring-blue-700"
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge color={role === UserRole.ADMIN ? "yellow" : "blue"}>{role}</Badge>
                        {role === user.role && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">(current)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getRoleDescription(role as UserRole)}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </Field>

          {/* Warning for Admin Role */}
          {newRole === UserRole.ADMIN && user.role !== UserRole.ADMIN && (
            <Panel className="p-3 border-yellow-200 dark:border-yellow-900/40 bg-yellow-50 dark:bg-yellow-900/10">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Admin users have full access to all platform features, including the ability to manage other users and sensitive data.
              </p>
            </Panel>
          )}

          {error && <ErrorMessage message={error} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          <ActionRow>
            <Button type="button" variant="neutral" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || newRole === user.role}>
              {loading ? "Changing..." : "Change Role"}
            </Button>
          </ActionRow>
        </form>
      </div>
    </BaseModal>
  );
}
