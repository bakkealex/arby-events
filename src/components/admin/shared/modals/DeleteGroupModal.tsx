"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Field } from "./components/Field";
import { Input } from "./components/Inputs";
import { Panel, ActionRow, Button } from "./components/Primitives";

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
        <Panel className="p-4 border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">This action cannot be undone</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Deleting this group will permanently remove all associated data, including events, member relationships, and activity history.
              </p>
            </div>
          </div>
        </Panel>

        {/* Group Details */}
        <Panel>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Group to delete:</h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Name:</span> {group.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">ID:</span> {group.id}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Members:</span> {group._count?.members ?? 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Events:</span> {group._count?.events ?? 0}</p>
          </div>
        </Panel>

        {/* Confirmation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="To confirm deletion, please type the group name:">
            <Input
              type="text"
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              placeholder={group.name}
              disabled={loading}
            />
            {confirmation && !isValidConfirmation && (
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">Group name does not match</p>
            )}
          </Field>

          {error && <ErrorMessage message={error} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          <ActionRow>
            <Button type="button" variant="neutral" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={loading || !isValidConfirmation}>
              {loading ? "Deleting..." : "Delete Group"}
            </Button>
          </ActionRow>
        </form>
      </div>
    </BaseModal>
  );
}
