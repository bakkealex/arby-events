"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

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

export default function AddMemberModal({
  open,
  onClose,
  groupId,
}: AddMemberModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  // Refs for managing focus and timeouts
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setUsers([]);
      setError(null);
      setSuccessMessage("");
      setHasSearched(false);

      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Clear timeout when modal closes
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    }
  }, [open]);

  // Debounced search function
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
        const { users: result } = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to search users");
        }

        const activeUsers = Array.isArray(result)
          ? result.filter(user => user.active === true)
          : [];
        setUsers(activeUsers);
      } catch (error) {
        console.error("Search error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to search users"
        );
        setUsers([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [groupId]
  );

  // Handle search input changes with debouncing
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      if (value.trim()) {
        searchTimeoutRef.current = setTimeout(() => {
          searchUsers(value);
        }, 200);
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
      // Use admin-specific route for admin actions
      const response = await fetch(`/api/admin/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: "MEMBER" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add member");
      }

      setSuccessMessage("Member added successfully!");

      // Remove user from search results
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      router.refresh();

      // Close modal after delay if no more users in results
      setTimeout(() => {
        if (users.length <= 1) {
          onClose();
        }
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add member");
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
    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onClose();
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="Add Member to Group"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search Users */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search for users to add
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              disabled={false} // Never disable input to maintain focus
            />

            {/* Loading indicator or clear button */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {searchLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : searchTerm ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1} // Prevent focus stealing
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
              {searchLoading
                ? "Searching..."
                : "Search results appear automatically"}
            </p>
          )}
        </div>

        {/* Search Results */}
        {users.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-600 rounded-md max-h-64 overflow-y-auto">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Found {users.length} user{users.length !== 1 ? "s" : ""}
              </h4>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {users.map(user => (
                <div
                  key={user.id}
                  className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name || "No name"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addMember(user.id)}
                    disabled={loading}
                    className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-3 flex-shrink-0"
                  >
                    <UserPlusIcon className="h-3 w-3 mr-1" />
                    {loading ? "Adding..." : "Add"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchTerm && users.length === 0 && !searchLoading && hasSearched && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No users found matching &quot;{searchTerm}&quot;</p>
            <p className="text-xs mt-1">
              Try searching with a different name or email
            </p>
          </div>
        )}

        {/* Initial State */}
        {!searchTerm && !hasSearched && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <UserPlusIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Start typing to search for users</p>
            <p className="text-xs mt-1">Search by name or email address</p>
          </div>
        )}

        {error && <ErrorMessage message={error} />}
        {successMessage && <SuccessMessage message={successMessage} />}

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
