"use client";
import { useState } from "react";
import type { GroupWithDetails } from "@/types/admin";
import { DEFAULT_LOCALE } from "@/lib/constants";

export default function GroupDetails({ group }: { group: GroupWithDetails }) {
  const [showMembers, setShowMembers] = useState(false);

  // Separate upcoming and past events
  const now = new Date();
  const events = group.events || [];
  const upcomingEvents = events
    .filter(event => new Date(event.endDate) >= now)
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  const pastEvents = events
    .filter(event => new Date(event.endDate) < now)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
      <p className="text-gray-600 mb-4">
        {group.description || "No description provided."}
      </p>
      <div className="mb-4">
        <span className="block text-sm text-gray-500">
          Created:{" "}
          {new Date(group.createdAt).toLocaleDateString(DEFAULT_LOCALE)}
        </span>
        {group.creator && (
          <span className="block text-sm text-gray-500">
            Created by: {group.creator.name || group.creator.email || "Unknown"}
          </span>
        )}
      </div>
      <div className="mb-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          onClick={() => setShowMembers(v => !v)}
        >
          {showMembers ? "Hide" : "Show"} Members ({group.userGroups.length})
        </button>
      </div>
      {showMembers && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Members</h2>
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {group.userGroups.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No members found.
                  </td>
                </tr>
              )}
              {group.userGroups &&
                group.userGroups.map(ug => (
                  <tr key={ug.userId}>
                    <td className="px-4 py-2">{ug.user?.name || "Unknown"}</td>
                    <td className="px-4 py-2">{ug.user?.email || "Unknown"}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${ug.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {ug.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">{ug.joinedAt}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upcoming Events Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Start
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                End
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <tr key={event.id}>
                  <td className="px-4 py-2">{event.title}</td>
                  <td className="px-4 py-2">
                    {new Date(event.startDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(event.endDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{event.location || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No upcoming events.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Past Events Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Past Events</h2>
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Start
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                End
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pastEvents.length > 0 ? (
              pastEvents.map(event => (
                <tr key={event.id}>
                  <td className="px-4 py-2">{event.title}</td>
                  <td className="px-4 py-2">
                    {new Date(event.startDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(event.endDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{event.location || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No past events.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
