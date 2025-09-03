"use client";
import { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import ManageEventModal from "@/components/admin/shared/modals/ManageEventModal";

interface EventSettingsProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    location: string | null;
    group: {
      id: string;
      name: string;
    };
    creator: {
      id: string;
      name: string | null;
      email: string;
    };
    _count: {
      eventSubscriptions: number;
    };
  };
}

export default function EventSettings({ event }: EventSettingsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.href = "/admin/events";
      } else {
        console.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Event Actions
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Edit Event
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update event details, dates, or location
              </p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Event
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-400">
                Delete Event
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                Permanently delete this event and all subscriptions
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete Event
            </button>
          </div>
        </div>
      </div>

      {/* Event Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Event Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event ID
            </label>
            <p className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
              {event.id}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subscriber Count
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {event._count.eventSubscriptions} people subscribed
            </p>
          </div>
        </div>
      </div>

      {/* Edit Event Modal */}
      {showEditModal && (
        <ManageEventModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          groupId={event.group.id}
          event={{
            id: event.id,
            title: event.title,
            description: event.description,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            location: event.location,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            groupId: event.group.id,
            createdBy: event.creator.id,
            creator: event.creator,
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Event
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete &quot;{event.title}&quot;? This action
                cannot be undone. All {event._count.eventSubscriptions}{" "}
                subscriptions will also be deleted.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
