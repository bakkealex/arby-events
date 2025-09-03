"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import useUserManagement from "@/hooks/useUserManagement";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Field } from "./components/Field";
import { Input } from "./components/Inputs";
import { Panel, ActionRow, Button } from "./components/Primitives";

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
        <Panel className="p-4 border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">This will deactivate the user account</h3>
              <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                The user will not be able to log in until their account is reactivated. All their data and group memberships will be preserved.
              </p>
            </div>
          </div>
        </Panel>

        {/* User Details */}
        <Panel>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">User to deactivate:</h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Name:</span> {user.name || "No name"}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Email:</span> {user.email}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Role:</span> {user.role}</p>
          </div>
        </Panel>

        {/* Confirmation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="To confirm deactivation, please type the user's email address:">
            <Input
              type="text"
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              placeholder={user.email}
              disabled={loading}
            />
            {confirmation && !isValidConfirmation && (
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">Email address does not match</p>
            )}
          </Field>

          {error && <ErrorMessage message={error} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          <ActionRow>
            <Button type="button" variant="neutral" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={loading || !isValidConfirmation}>
              {loading ? "Deactivating..." : "Deactivate User"}
            </Button>
          </ActionRow>
        </form>
      </div>
    </BaseModal>
  );
}
