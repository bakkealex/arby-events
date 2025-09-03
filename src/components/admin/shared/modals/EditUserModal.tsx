"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import { Field } from "./components/Field";
import { Input, Select, Checkbox } from "./components/Inputs";
import { ActionRow, Button } from "./components/Primitives";
import useUserManagement from "@/hooks/useUserManagement";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { UserRole } from "@prisma/client";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    active?: boolean;
  };
}

export default function EditUserModal({
  open,
  onClose,
  user,
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
    role: user.role as UserRole,
    active: user.active ?? true,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const { loading, error, editUser, clearError } = useUserManagement();

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: user.name || "",
        email: user.email,
        role: user.role as UserRole,
        active: user.active ?? true,
      });
      setSuccessMessage("");
      clearError();
    }
  }, [open, user, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const result = await editUser({
        id: user.id,
        ...formData,
      });

      if (result) {
        setSuccessMessage("User updated successfully!");
        router.refresh();

        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="Edit User" size="lg">
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

        <Field label="Role *">
          <Select
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
            disabled={loading}
          >
            <option value={UserRole.USER}>User</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </Select>
        </Field>

        <div className="flex items-center gap-2">
          <Checkbox
            id="active"
            checked={formData.active}
            onChange={e => setFormData({ ...formData, active: e.currentTarget.checked })}
            disabled={loading}
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active Account
          </label>
        </div>

        {error && <ErrorMessage message={error} />}
        {successMessage && <SuccessMessage message={successMessage} />}

        <ActionRow>
          <Button type="button" variant="neutral" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </ActionRow>
      </form>
    </BaseModal>
  );
}
