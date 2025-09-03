"use client";
import { useState } from "react";
import Link from "next/link";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import ManageEventModal from "@/components/admin/shared/modals/ManageEventModal";
import CreateEventModal from "@/components/admin/shared/modals/CreateEventModal";
import EventPagination from "./EventPagination";

interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  location: string | null;
  createdAt: Date;
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
}

interface EventsTableProps {
  events: Event[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function EventsTable({ events, pagination }: EventsTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowManageModal(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = (startDate: Date) => {
    return new Date(startDate) > new Date();
  };

  const isPast = (endDate: Date) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Events ({events.length})
            {pagination && (
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                (Page {pagination.page} of {pagination.pages},{" "}
                {pagination.total} total)
              </span>
            )}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Event
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Event
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Group
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Date & Time
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Subscribers
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr
                  key={event.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </div>
                      {event.location && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          📍 {event.location}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Created by {event.creator.name || event.creator.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Link
                      href={`/admin/groups/${event.group.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {event.group.name}
                    </Link>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-white">
                        {formatDate(event.startDate)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        to {formatDate(event.endDate)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {event._count.eventSubscriptions}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isPast(event.endDate)
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          : isUpcoming(event.startDate)
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {isPast(event.endDate)
                        ? "Past"
                        : isUpcoming(event.startDate)
                          ? "Upcoming"
                          : "Ongoing"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        title="Edit event"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete event"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No events found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <EventPagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}

      {showCreateModal && (
        <CreateEventModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          // No groupId means admin can select any group
        />
      )}

      {showManageModal && selectedEvent && (
        <ManageEventModal
          open={showManageModal}
          onClose={() => {
            setShowManageModal(false);
            setSelectedEvent(null);
          }}
          event={{
            ...selectedEvent,
            startDate: selectedEvent.startDate.toISOString(),
            endDate: selectedEvent.endDate.toISOString(),
            createdAt: selectedEvent.createdAt.toISOString(),
            updatedAt: selectedEvent.createdAt.toISOString(), // Use createdAt as fallback
            groupId: selectedEvent.group.id,
            createdBy: selectedEvent.creator.id,
          }}
          groupId={selectedEvent.group.id}
        />
      )}
    </div>
  );
}
