"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface DeleteGroupModalProps {
  open: boolean;
  onClose: () => void;
  group: {
    id: string;
    name: string;
    _count?: {
      members?: number;
      events?: number;
    };
  };
}

export default function DeleteGroupModal({
  open,
  onClose,
  group,
}: DeleteGroupModalProps) {
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmation !== group.name) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete group");
      }

      setSuccessMessage("Group deleted successfully! Redirecting...");

      setTimeout(() => {
        router.push("/admin/groups");
        router.refresh();
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete group"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmation("");
    setSuccessMessage("");
    setError(null);
    onClose();
  };

  const isValidConfirmation = confirmation === group.name;

  return (
    <BaseModal open={open} onClose={handleClose} title="Delete Group" size="md">
      <div className="space-y-4">
        {/* Warning Notice */}
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              This action cannot be undone
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Deleting this group will permanently remove all associated data,
              including events, member relationships, and activity history.
            </p>
          </div>
        </div>

        {/* Group Details */}
        <div className="bg-gray-50 rounded-md p-4 dark:bg-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Group to delete:
          </h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Name:</span> {group.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">ID:</span> {group.id}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Members:</span>{" "}
              {group._count?.members ?? 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Events:</span>{" "}
              {group._count?.events ?? 0}
            </p>
          </div>
        </div>

        {/* Confirmation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To confirm deletion, please type the group name:
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              placeholder={group.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
            {confirmation && !isValidConfirmation && (
              <p className="text-sm text-red-600 mt-1">
                Group name does not match
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
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Group"}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}
