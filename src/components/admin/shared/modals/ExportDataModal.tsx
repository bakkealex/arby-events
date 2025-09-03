"use client";
import { useState } from "react";
import BaseModal from "./BaseModal";
import {
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface ExportDataModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
}

export default function ExportDataModal({
  open,
  onClose,
  groupId,
}: ExportDataModalProps) {
  const [exportOptions, setExportOptions] = useState({
    format: "csv" as "csv" | "json" | "excel",
    includeMembers: true,
    includeEvents: true,
    includeSubscriptions: true,
    dateRange: "all" as "all" | "last30" | "last90" | "custom",
    customStartDate: "",
    customEndDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        format: exportOptions.format,
        includeMembers: exportOptions.includeMembers.toString(),
        includeEvents: exportOptions.includeEvents.toString(),
        includeSubscriptions: exportOptions.includeSubscriptions.toString(),
        dateRange: exportOptions.dateRange,
        ...(exportOptions.dateRange === "custom" && {
          startDate: exportOptions.customStartDate,
          endDate: exportOptions.customEndDate,
        }),
      });

      const response = await fetch(
        `/api/admin/groups/${groupId}/export?${queryParams}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `group-${groupId}-export.${exportOptions.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        onClose();
      } else {
        throw new Error("Export failed");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatOptions = [
    {
      value: "csv",
      label: "CSV",
      icon: TableCellsIcon,
      description: "Comma-separated values",
    },
    {
      value: "json",
      label: "JSON",
      icon: DocumentTextIcon,
      description: "JavaScript Object Notation",
    },
    {
      value: "excel",
      label: "Excel",
      icon: DocumentArrowDownIcon,
      description: "Microsoft Excel format",
    },
  ];

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Export Group Data"
      size="lg"
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {formatOptions.map(format => (
              <button
                key={format.value}
                type="button"
                onClick={() =>
                  setExportOptions({
                    ...exportOptions,
                    format: format.value as any,
                  })
                }
                className={`p-3 border rounded-lg text-center transition-colors ${
                  exportOptions.format === format.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <format.icon className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm font-medium">{format.label}</div>
                <div className="text-xs text-gray-500">
                  {format.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Data Inclusion Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Include Data
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeMembers}
                onChange={e =>
                  setExportOptions({
                    ...exportOptions,
                    includeMembers: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Member information and roles
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeEvents}
                onChange={e =>
                  setExportOptions({
                    ...exportOptions,
                    includeEvents: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Event details and schedules
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeSubscriptions}
                onChange={e =>
                  setExportOptions({
                    ...exportOptions,
                    includeSubscriptions: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Event subscriptions and attendance
              </span>
            </label>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Date Range
          </label>
          <select
            value={exportOptions.dateRange}
            onChange={e =>
              setExportOptions({
                ...exportOptions,
                dateRange: e.target.value as any,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          >
            <option value="all">All time</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>

          {exportOptions.dateRange === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={exportOptions.customStartDate}
                  onChange={e =>
                    setExportOptions({
                      ...exportOptions,
                      customStartDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={exportOptions.customEndDate}
                  onChange={e =>
                    setExportOptions({
                      ...exportOptions,
                      customEndDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Export Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Export Summary
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Format: {exportOptions.format.toUpperCase()}</li>
            <li>
              • Date range:{" "}
              {exportOptions.dateRange === "custom"
                ? "Custom"
                : exportOptions.dateRange}
            </li>
            <li>
              • Includes:{" "}
              {[
                exportOptions.includeMembers && "Members",
                exportOptions.includeEvents && "Events",
                exportOptions.includeSubscriptions && "Subscriptions",
              ]
                .filter(Boolean)
                .join(", ")}
            </li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={
              isLoading ||
              (!exportOptions.includeMembers &&
                !exportOptions.includeEvents &&
                !exportOptions.includeSubscriptions)
            }
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Exporting..." : "Export Data"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
