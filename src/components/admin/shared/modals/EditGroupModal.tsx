"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";

interface EditGroupModalProps {
  open: boolean;
  onClose: () => void;
  group: {
    id: string;
    name: string;
    description?: string | null | undefined;
  };
}

export default function EditGroupModal({
  open,
  onClose,
  group,
}: EditGroupModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Reset form when modal opens or group changes
  useEffect(() => {
    if (open && group) {
      setFormData({
        name: group.name || "",
        description: group.description ?? "",
      });
      setSuccessMessage("");
      setError(null);
    }
  }, [open, group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update group");
      }

      setSuccessMessage("Group updated successfully!");
      router.refresh();

      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update group"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessMessage("");
    setError(null);
    onClose();
  };

  return (
    <BaseModal open={open} onClose={handleClose} title="Edit Group" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Group Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter group name"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Describe the purpose of this group..."
            disabled={loading}
          />
        </div>

        <div className="bg-gray-50 rounded-md p-4 dark:bg-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Current Group Details
          </h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">ID:</span> {group.id}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Current Name:</span> {group.name}
            </p>
          </div>
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
            disabled={loading || !formData.name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Group"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
