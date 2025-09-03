"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import { Panel, Button, ActionRow, Badge } from "./components/Primitives";
import { Field } from "./components/Field";
import { Input, Textarea } from "./components/Inputs";
import {
  ExclamationTriangleIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface Event {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
  groupId: string;
  createdBy: string;
  creator?: {
    id: string;
    name?: string | null;
    email: string;
  };
  _count?: {
    eventSubscriptions: number;
  };
}

interface ManageEventModalProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  groupId: string;
}

export default function ManageEventModal({
  open,
  onClose,
  event,
  groupId,
}: ManageEventModalProps) {
  const [activeAction, setActiveAction] = useState<"view" | "edit" | "delete">(
    "view"
  );
  const [editFormData, setEditFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    startDate: event?.startDate
      ? new Date(event.startDate).toISOString().slice(0, 16)
      : "",
    endDate: event?.endDate
      ? new Date(event.endDate).toISOString().slice(0, 16)
      : "",
    location: event?.location || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const router = useRouter();

  // Reset form data when event changes
  useEffect(() => {
    if (event) {
      setEditFormData({
        title: event.title,
        description: event.description || "",
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        location: event.location || "",
      });
    }
  }, [event]);

  if (!event) return null;

  const handleEditEvent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          startDate: new Date(editFormData.startDate).toISOString(),
          endDate: new Date(editFormData.endDate).toISOString(),
          groupId: event.groupId, // Ensure groupId is included
        }),
      });

      if (response.ok) {
        router.refresh();
        onClose();
        setActiveAction("view");
      } else {
        throw new Error("Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
        onClose();
        setActiveAction("view");
        setConfirmDelete(false);
        setDeleteConfirmText("");
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) return { label: "Upcoming", color: "blue" };
    if (now >= startDate && now <= endDate)
      return { label: "Active", color: "green" };
    return { label: "Past", color: "gray" };
  };

  const status = getEventStatus();

  const renderContent = () => {
    switch (activeAction) {
      case "view":
        return (
          <div className="space-y-6">
            {/* Event Status */}
            <div className="flex items-center justify-between mb-4">
              <Badge color={status.color as any}>{status.label}</Badge>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {event._count?.eventSubscriptions || 0} subscribers
              </div>
            </div>

            {/* Event Details */}
            <Panel>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Event Information</h3>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Event Title
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white mt-1">
                    {event.title}
                  </dd>
                </div>

                {event.description && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white mt-1">
                      {event.description}
                    </dd>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Start Date
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white mt-1">
                      {new Date(event.startDate).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      End Date
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white mt-1">
                      {new Date(event.endDate).toLocaleString()}
                    </dd>
                  </div>
                </div>

                {event.location && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      Location
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white mt-1">
                      {event.location}
                    </dd>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created By
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white mt-1">
                      {event.creator?.name || event.creator?.email || "Unknown"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      Subscribers
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white mt-1">
                      {event._count?.eventSubscriptions || 0} people
                    </dd>
                  </div>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Event ID
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono mt-1">
                    {event.id}
                  </dd>
                </div>
              </dl>
            </Panel>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button onClick={() => setActiveAction("edit")} className="flex items-center justify-center">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
              <Button onClick={() => window.open(`/events/${event.id}`, "_blank")} variant="neutral" className="flex items-center justify-center">
                <EyeIcon className="h-4 w-4 mr-2" />
                View Public
              </Button>
              <Button onClick={() => setActiveAction("delete")} variant="danger" className="flex items-center justify-center">
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Event
              </Button>
            </div>
          </div>
        );

      case "edit":
        return (
          <div className="space-y-4">
            <Panel className="p-4 border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">Edit Event</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Update the event details. Changes will be visible to all subscribers.</p>
            </Panel>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleEditEvent();
              }}
              className="space-y-4"
            >
              <Field label="Event Title *">
                <Input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </Field>

              <Field label="Description">
                <Textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Start Date & Time *">
                  <Input
                    type="datetime-local"
                    required
                    value={editFormData.startDate}
                    onChange={e => setEditFormData({ ...editFormData, startDate: e.target.value })}
                  />
                </Field>
                <Field label="End Date & Time *">
                  <Input
                    type="datetime-local"
                    required
                    value={editFormData.endDate}
                    onChange={e => setEditFormData({ ...editFormData, endDate: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Location">
                <Input
                  type="text"
                  value={editFormData.location}
                  onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                  placeholder="Event location (optional)"
                />
              </Field>

              <ActionRow>
                <Button type="button" variant="neutral" onClick={() => setActiveAction("view")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </ActionRow>
            </form>
          </div>
        );

      case "delete":
        return (
          <div className="space-y-4">
            {!confirmDelete ? (
              <>
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Event?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Are you sure you want to delete &quot;{event.title}&quot;?</p>
                  </div>
                </div>

                <Panel className="p-3 border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10">
                  <p className="text-sm text-red-800 dark:text-red-200"><strong>This action will:</strong></p>
                  <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                    <li>• Permanently delete the event</li>
                    <li>• Cancel all {event._count?.eventSubscriptions || 0} subscriber registrations</li>
                    <li>• Remove the event from all calendars</li>
                    <li>• Send cancellation notifications to subscribers</li>
                    <li>• This action cannot be undone</li>
                  </ul>
                </Panel>

                <ActionRow>
                  <Button variant="neutral" onClick={() => setActiveAction("view")}>Cancel</Button>
                  <Button variant="danger" onClick={() => setConfirmDelete(true)}>Continue</Button>
                </ActionRow>
              </>
            ) : (
              <>
                <div className="text-center">
                  <ExclamationTriangleIcon className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Final Confirmation</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type <strong>DELETE</strong> to confirm deletion of &quot;{event.title}&quot;:</p>
                </div>

                <Input
                  type="text"
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                />

                <ActionRow>
                  <Button
                    variant="neutral"
                    onClick={() => {
                      setConfirmDelete(false);
                      setDeleteConfirmText("");
                      setActiveAction("view");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDeleteEvent}
                    disabled={isLoading || deleteConfirmText !== "DELETE"}
                    className="disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Deleting..." : "Delete Event"}
                  </Button>
                </ActionRow>
              </>
            )}
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
      title={`Manage Event - ${event.title}`}
      size="lg"
      showCloseButton={activeAction === "view"}
    >
      {renderContent()}
    </BaseModal>
  );
}
