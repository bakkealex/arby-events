"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import useUserManagement from "@/hooks/useUserManagement";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";

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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sendEmail"
            checked={sendEmail}
            onChange={e => setSendEmail(e.target.checked)}
            disabled={loading}
          />
          <label
            htmlFor="sendEmail"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Send login credentials via email
          </label>
        </div>

        {error && <ErrorMessage message={error} />}
        {successMessage && <SuccessMessage message={successMessage} />}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
