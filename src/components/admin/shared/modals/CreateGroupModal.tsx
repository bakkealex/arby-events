"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { Field } from "./components/Field";
import { Input, Textarea } from "./components/Inputs";
import { ActionRow, Button } from "./components/Primitives";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({
  open,
  onClose,
}: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({ name: "", description: "" });
      setSuccessMessage("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create group");
      }

      setSuccessMessage("Group created successfully!");
      setFormData({ name: "", description: "" });
      router.refresh();

      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create group"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setSuccessMessage("");
    setError(null);
    onClose();
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="Create New Group"
      size="lg"
    >
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

        {error && <ErrorMessage message={error} />}
        {successMessage && <SuccessMessage message={successMessage} />}

        <ActionRow>
          <Button type="button" onClick={handleClose} variant="neutral" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.name.trim()}>
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </ActionRow>
      </form>
    </BaseModal>
  );
}
