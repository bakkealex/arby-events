"use client";

import { useState, useEffect } from "react";

type Group = {
  id?: string;
  name: string;
  description?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; id?: string }) => void;
  initial?: Group | null;
};

export default function GroupModal({
  open,
  onClose,
  onSubmit,
  initial,
}: Props) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");

  // Reset form when modal opens/closes or initial changes
  useEffect(() => {
    setName(initial?.name || "");
    setDescription(initial?.description || "");
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">
          {initial ? "Edit Group" : "Add Group"}
        </h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit({ name, description, id: initial?.id });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={255}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {initial ? "Save Changes" : "Add Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
