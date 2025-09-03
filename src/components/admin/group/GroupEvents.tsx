"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/constants";
import type { AdminGroupView } from "@/types";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import CreateEventModal from "@/components/admin/shared/modals/CreateEventModal";
import ManageEventModal from "@/components/admin/shared/modals/ManageEventModal";

interface GroupEventsProps {
  group: AdminGroupView;
}

export default function GroupEvents({ group }: GroupEventsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "upcoming" | "active" | "past"
  >("all");
  const [sortBy, setSortBy] = useState<"startDate" | "title" | "subscriptions">(
    "startDate"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [managingEvent, setManagingEvent] = useState<any>(null);

  const now = new Date();

  const getEventStatus = (event: any) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (end < now) return "past";
    if (start <= now && end >= now) return "active";
    return "upcoming";
  };

  const filteredAndSortedEvents = useMemo(() => {
    const filtered = (group.events ?? []).filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const eventStatus = getEventStatus(event);
      const matchesStatus =
        statusFilter === "all" || eventStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "subscriptions":
          return (
            (b._count?.eventSubscriptions || 0) -
            (a._count?.eventSubscriptions || 0)
          );
        case "startDate":
        default:
          return (
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
      }
    });
  }, [group.events, searchTerm, statusFilter, sortBy, now]);

  const events = group.events ?? [];
  const eventStats = {
    total: events.length,
    upcoming: events.filter(e => getEventStatus(e) === "upcoming").length,
    active: events.filter(e => getEventStatus(e) === "active").length,
    past: events.filter(e => getEventStatus(e) === "past").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "past":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header and Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Group Events
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage events for this group
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Event
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {eventStats.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Events
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {eventStats.upcoming}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upcoming
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {eventStats.active}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Now
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {eventStats.past}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Past Events
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active Now</option>
              <option value="past">Past Events</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="startDate">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="subscriptions">Sort by Attendance</option>
            </select>
          </div>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedEvents.length} of {events.length} events
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedEvents.map(event => {
                const status = getEventStatus(event);
                return (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {event.description || "No description"}
                        </div>
                        {event.location && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            📍 {event.location}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div>
                        <div>
                          {new Date(event.startDate).toLocaleDateString(
                            DEFAULT_LOCALE
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.startDate).toLocaleTimeString()} -{" "}
                          {new Date(event.endDate).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(status)}`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {event._count?.eventSubscriptions || 0}
                        </span>
                        <span className="ml-1 text-gray-500 dark:text-gray-400">
                          registered
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {event.creator?.name || event.creator?.email || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setManagingEvent(event)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAndSortedEvents.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No events found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateEventModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        groupId={group.id}
      />
      <ManageEventModal
        open={!!managingEvent}
        onClose={() => setManagingEvent(null)}
        event={managingEvent}
        groupId={group.id}
      />
    </>
  );
}
