"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import { Field } from "./components/Field";
import { Input } from "./components/Inputs";
import { ActionRow, Button, Panel } from "./components/Primitives";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { MagnifyingGlassIcon, UserPlusIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  name: string | null;
  email: string;
  active: boolean;
  createdAt: string;
}

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
}

export default function AddMemberModal({ open, onClose, groupId }: AddMemberModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  const searchTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setUsers([]);
      setError(null);
      setSuccessMessage("");
      setHasSearched(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [open]);

  const searchUsers = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setUsers([]);
        setHasSearched(false);
        return;
      }
      setSearchLoading(true);
      setError(null);
      setHasSearched(true);
      try {
        const response = await fetch(
          `/api/admin/users/search?q=${encodeURIComponent(term)}&excludeGroup=${groupId}`
        );
        const data = await response.json();
        const result = data?.users ?? [];
        if (!response.ok) {
          throw new Error(data?.error || "Failed to search users");
        }
        const activeUsers = Array.isArray(result) ? result.filter((u: User) => u.active === true) : [];
        setUsers(activeUsers);
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Failed to search users");
        setUsers([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [groupId]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current as number);
      if (value.trim()) {
        searchTimeoutRef.current = setTimeout(() => searchUsers(value), 200);
      } else {
        setUsers([]);
        setHasSearched(false);
      }
    },
    [searchUsers]
  );

  const addMember = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: "MEMBER" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to add member");
      setSuccessMessage("Member added successfully!");
      setUsers(prev => prev.filter(u => u.id !== userId));
      router.refresh();
      setTimeout(() => {
        if (users.length <= 1) onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setUsers([]);
    setHasSearched(false);
    setError(null);
    inputRef.current?.focus();
  };

  const handleClose = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current as number);
    onClose();
  };

  return (
    <BaseModal open={open} onClose={handleClose} title="Add Member to Group" size="lg">
      <div className="space-y-4">
        <Field label="Search for users to add">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search by name or email..."
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {searchLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : searchTerm ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              ) : (
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
          {searchTerm && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {searchLoading ? "Searching..." : "Search results appear automatically"}
            </p>
          )}
        </Field>

        {users.length > 0 && (
          <Panel className="p-0 max-h-64 overflow-y-auto">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-md">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Found {users.length} user{users.length !== 1 ? "s" : ""}
              </h4>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {users.map(user => (
                <div key={user.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name || "No name"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button type="button" onClick={() => addMember(user.id)} disabled={loading} className="ml-3 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                    <UserPlusIcon className="h-3 w-3 mr-1" />
                    {loading ? "Adding..." : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {searchTerm && users.length === 0 && !searchLoading && hasSearched && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No users found matching &quot;{searchTerm}&quot;</p>
            <p className="text-xs mt-1">Try searching with a different name or email</p>
          </div>
        )}

        {!searchTerm && !hasSearched && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <UserPlusIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Start typing to search for users</p>
            <p className="text-xs mt-1">Search by name or email address</p>
          </div>
        )}

        {error && <ErrorMessage message={error} />}
        {successMessage && <SuccessMessage message={successMessage} />}

        <ActionRow className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <Button type="button" variant="neutral" onClick={handleClose}>
            Close
          </Button>
        </ActionRow>
      </div>
    </BaseModal>
  );
}
