"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import useUserManagement from "@/hooks/useUserManagement";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface DeactivateUserModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export default function DeactivateUserModal({
  open,
  onClose,
  user,
}: DeactivateUserModalProps) {
  const [confirmation, setConfirmation] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const { loading, error, deactivateUser, clearError } = useUserManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmation !== user.email) {
      return;
    }

    clearError();

    try {
      const result = await deactivateUser(user.id);

      if (result) {
        setSuccessMessage("User deactivated successfully!");
        router.refresh();

        setTimeout(() => {
          onClose();
          setConfirmation("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  };

  const handleClose = () => {
    setConfirmation("");
    setSuccessMessage("");
    clearError();
    onClose();
  };

  const isValidConfirmation = confirmation === user.email;

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="Deactivate User"
      size="md"
    >
      <div className="space-y-4">
        {/* Warning */}
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-md">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              This will deactivate the user account
            </h3>
            <p className="text-sm text-red-700 mt-1">
              The user will not be able to log in until their account is
              reactivated. All their data and group memberships will be
              preserved.
            </p>
          </div>
        </div>

        {/* User Details */}
        <div className="bg-gray-50 rounded-md p-4 dark:bg-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            User to deactivate:
          </h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Name:</span>{" "}
              {user.name || "No name"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Role:</span> {user.role}
            </p>
          </div>
        </div>

        {/* Confirmation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To confirm deactivation, please type the user&apos;s email address:
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              placeholder={user.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
            {confirmation && !isValidConfirmation && (
              <p className="text-sm text-red-600 mt-1">
                Email address does not match
              </p>
            )}
          </div>

          {error && <ErrorMessage message={error} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isValidConfirmation}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deactivating..." : "Deactivate User"}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}
