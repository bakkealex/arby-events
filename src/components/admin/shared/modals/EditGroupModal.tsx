"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { Field } from "./components/Field";
import { Input, Textarea } from "./components/Inputs";
import { ActionRow, Button, Panel } from "./components/Primitives";

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
        <Field label="Group Name *">
          <Input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter group name"
            disabled={loading}
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Describe the purpose of this group..."
            disabled={loading}
          />
        </Field>

        <Panel>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Current Group Details</h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">ID:</span> {group.id}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Current Name:</span> {group.name}
            </p>
          </div>
        </Panel>

        {error && <ErrorMessage message={error} />}
        {successMessage && <SuccessMessage message={successMessage} />}

        <ActionRow>
          <Button type="button" onClick={handleClose} variant="neutral" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.name.trim()}>
            {loading ? "Updating..." : "Update Group"}
          </Button>
        </ActionRow>
      </form>
    </BaseModal>
  );
}
