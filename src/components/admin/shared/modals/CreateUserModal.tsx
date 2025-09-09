"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import useUserManagement from "@/hooks/useUserManagement";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { Field } from "./components/Field";
import { Input, Checkbox } from "./components/Inputs";
import { ActionRow, Button } from "./components/Primitives";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateUserModal({
  open,
  onClose,
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [sendEmail, setSendEmail] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const { loading, error, createUser, clearError } = useUserManagement();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({ name: "", email: "" });
      setSendEmail(true);
      setSuccessMessage("");
      clearError();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const result = await createUser(formData, { sendMail: sendEmail });
      if (result) {
        const message = sendEmail
          ? `User created successfully! Credentials have been sent to ${formData.email}`
          : `User created successfully! Temporary password: ${(result as any).user?.password || "Generated automatically"}`;

        setSuccessMessage(message);
        // Reset form
        setFormData({ name: "", email: "" });
        // Refresh the page data
        router.refresh();
        // Close modal after a delay to show success message
        if (sendEmail) {
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      }
    } catch (error) {
      // Error is handled by the hook
      console.error("Error creating user:", error);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="Create New User" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name *">
          <Input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            disabled={loading}
          />
        </Field>

        <Field label="Email *">
          <Input
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />
        </Field>

        <div className="flex items-center gap-2">
          <Checkbox id="sendEmail" checked={sendEmail} onChange={e => setSendEmail(e.currentTarget.checked)} disabled={loading} />
          <label htmlFor="sendEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Send login credentials via email
          </label>
        </div>

        {error && <ErrorMessage message={error} />}
        {successMessage && <SuccessMessage message={successMessage} />}

        <ActionRow>
          <Button type="button" onClick={onClose} variant="neutral" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </Button>
        </ActionRow>
      </form>
    </BaseModal>
  );
}
