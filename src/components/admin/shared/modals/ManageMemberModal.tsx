"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/constants";
import BaseModal from "./BaseModal";
import { Panel, Button, ActionRow, Badge } from "./components/Primitives";
import { Field } from "./components/Field";
import { Select } from "./components/Inputs";
import {
  ExclamationTriangleIcon,
  UserMinusIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface Member {
  userId: string;
  groupId: string;
  role: string;
  joinedAt: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    role?: string;
  };
}

interface ManageMemberModalProps {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  groupId: string;
}

export default function ManageMemberModal({
  open,
  onClose,
  member,
  groupId,
}: ManageMemberModalProps) {
  const [activeAction, setActiveAction] = useState<
    "view" | "edit" | "remove" | "promote"
  >("view");
  const [newRole, setNewRole] = useState(member?.role || "MEMBER");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const router = useRouter();

  if (!member) return null;

  const handleRoleChange = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.userId, role: newRole }),
      });

      if (response.ok) {
        router.refresh();
        onClose();
        setActiveAction("view");
      } else {
        throw new Error("Failed to update member role");
      }
    } catch (error) {
      console.error("Error updating member role:", error);
      alert("Failed to update member role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/groups/${groupId}/members/${member.userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        router.refresh();
        onClose();
        setActiveAction("view");
        setConfirmRemoval(false);
      } else {
        throw new Error("Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeAction) {
      case "view":
        return (
          <div className="space-y-6">
            {/* Member Info */}
            <Panel>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Member Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {member.user?.name || "No name set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {member.user?.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Group Role</dt>
                  <dd className="text-sm">
                    <Badge color={member.role === "ADMIN" ? "yellow" : "gray"}>{member.role}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Platform Role
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {member.user?.role || "USER"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Joined Date
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {new Date(member.joinedAt).toLocaleDateString(
                      DEFAULT_LOCALE
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Member ID
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono">
                    {member.userId}
                  </dd>
                </div>
              </dl>
            </Panel>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button onClick={() => setActiveAction("edit")} className="flex items-center justify-center">
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Change Role
              </Button>
              <Button onClick={() => setActiveAction("remove")} variant="danger" className="flex items-center justify-center">
                <UserMinusIcon className="h-4 w-4 mr-2" />
                Remove Member
              </Button>
              <Button onClick={onClose} variant="neutral">
                Close
              </Button>
            </div>
          </div>
        );

      case "edit":
        return (
          <div className="space-y-4">
            <Panel className="p-4 border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-2">Change Member Role</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Update {member.user?.name || member.user?.email}&apos;s role in this group.</p>
            </Panel>

            <Field label="Select New Role">
              <Select value={newRole} onChange={e => setNewRole(e.target.value)}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Group Administrator</option>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Group Administrators can manage events, members, and group settings.</p>
            </Field>

            <ActionRow>
              <Button variant="neutral" onClick={() => setActiveAction("view")}>Cancel</Button>
              <Button onClick={handleRoleChange} disabled={isLoading || newRole === member.role}>
                {isLoading ? "Updating..." : "Update Role"}
              </Button>
            </ActionRow>
          </div>
        );

      case "remove":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Remove Member?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Are you sure you want to remove {member.user?.name || member.user?.email} from this group?</p>
              </div>
            </div>

            <Panel className="p-3 border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10">
              <p className="text-sm text-red-800 dark:text-red-200"><strong>This action will:</strong></p>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                <li>• Remove the member from this group</li>
                <li>• Cancel their subscriptions to group events</li>
                <li>• Revoke their access to group resources</li>
                <li>• This action can be reversed by re-adding them</li>
              </ul>
            </Panel>

            <ActionRow>
              <Button variant="neutral" onClick={() => setActiveAction("view")}>Cancel</Button>
              <Button variant="danger" onClick={handleRemoveMember} disabled={isLoading}>
                {isLoading ? "Removing..." : "Remove Member"}
              </Button>
            </ActionRow>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={`Manage Member - ${member.user?.name || member.user?.email}`}
      size="lg"
      showCloseButton={activeAction === "view"}
    >
      {renderContent()}
    </BaseModal>
  );
}
