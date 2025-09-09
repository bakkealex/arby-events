"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import useUserManagement from "@/hooks/useUserManagement";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Field } from "./components/Field";
import { Input } from "./components/Inputs";
import { Panel, ActionRow, Button } from "./components/Primitives";

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
        {/* Info Notice */}
        <Panel className="p-4 border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/10">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                This will reactivate the user account
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                The user will regain access to their account and be able to log in. All their data and group memberships will remain intact.
              </p>
            </div>
          </div>
        </Panel>

        {/* User Details */}
        <Panel>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">User to activate:</h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Name:</span> {user.name || "No name"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Role:</span> {user.role}
            </p>
          </div>
        </Panel>

        {/* Confirmation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="To confirm activation, please type the user's email address:">
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
            <Button
              type="submit"
              variant="success"
              disabled={loading || !isValidConfirmation}
            >
              {loading ? "Activating..." : "Activate User"}
            </Button>
          </ActionRow>
        </form>
      </div>
    </BaseModal>
  );
}
