"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import useUserManagement from "@/hooks/useUserManagement";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface ActivateUserModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export default function ActivateUserModal({
  open,
  onClose,
  user,
}: ActivateUserModalProps) {
  const [confirmation, setConfirmation] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const { loading, error, activateUser, clearError } = useUserManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmation !== user.email) {
      return;
    }

    clearError();

    try {
      const result = await activateUser(user.id);

      if (result) {
        setSuccessMessage(
          "User activated successfully! They can now log in to their account."
        );
        router.refresh();

        setTimeout(() => {
          onClose();
          setConfirmation("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error activating user:", error);
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
      title="Activate User"
      size="md"
    >
      <div className="space-y-4">
        {/* Success Notice */}
        <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/20 dark:border-green-800">
          <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              This will reactivate the user account
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              The user will regain access to their account and be able to log
              in. All their data and group memberships will remain intact.
            </p>
          </div>
        </div>

        {/* User Details */}
        <div className="bg-gray-50 rounded-md p-4 dark:bg-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            User to activate:
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
              To confirm activation, please type the user&apos;s email address:
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              placeholder={user.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isValidConfirmation}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Activating..." : "Activate User"}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}
