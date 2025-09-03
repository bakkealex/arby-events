"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import { Field } from "./components/Field";
import { Input, Textarea, Select } from "./components/Inputs";
import { ActionRow, Button } from "./components/Primitives";

interface Group {
  id: string;
  name: string;
}

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  groupId?: string;
}

export default function CreateEventModal({
  open,
  onClose,
  groupId,
}: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    groupId: groupId || "",
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const router = useRouter();

  // Fetch groups when modal opens
  useEffect(() => {
    if (open && !groupId) {
      setIsLoadingGroups(true);
      fetch("/api/admin/groups")
        .then(res => res.json())
        .then(data => setGroups(data))
        .catch(err => console.error("Failed to fetch groups:", err))
        .finally(() => setIsLoadingGroups(false));
    }
  }, [open, groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.refresh();
        onClose();
        setFormData({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
          location: "",
          groupId: groupId || "",
        });
      } else {
        throw new Error("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="Create New Event" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Group Selection - only show if no groupId is pre-selected */}
        {!groupId && (
          <Field label="Group *">
            {isLoadingGroups ? (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                Loading groups...
              </div>
            ) : (
              <Select
                required
                value={formData.groupId}
                onChange={e => setFormData({ ...formData, groupId: e.target.value })}
              >
                <option value="">Select a group...</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        )}

        <Field label="Event Title *">
          <Input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="Title of the event"
          />
        </Field>

        <Field label="Description">
          <Textarea
            rows={3}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date & Time *">
            <Input
              type="datetime-local"
              required
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
            />
          </Field>
          <Field label="End Date & Time *">
            <Input
              type="datetime-local"
              required
              value={formData.endDate}
              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Location">
          <Input
            type="text"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            placeholder="Event location (optional)"
          />
        </Field>

        <ActionRow>
          <Button type="button" variant="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || (!groupId && !formData.groupId)} className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
            {isLoading ? "Creating..." : "Create Event"}
          </Button>
        </ActionRow>
      </form>
    </BaseModal>
  );
}
