"use client";
import { useState } from "react";
import BaseModal from "./BaseModal";
import { Field } from "./components/Field";
import { Input, Select, Checkbox } from "./components/Inputs";
import { Panel, ActionRow, Button } from "./components/Primitives";
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
  const isCustomRange = exportOptions.dateRange === "custom";
  const isCustomRangeInvalid =
    isCustomRange && (
      !exportOptions.customStartDate ||
      !exportOptions.customEndDate ||
      new Date(exportOptions.customStartDate) > new Date(exportOptions.customEndDate)
    );
  const nothingSelected =
    !exportOptions.includeMembers &&
    !exportOptions.includeEvents &&
    !exportOptions.includeSubscriptions;
  const isExportDisabled = isLoading || nothingSelected || isCustomRangeInvalid;

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
        <Field label="Export Format">
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
                className={`p-3 border rounded-lg text-center transition-colors ${exportOptions.format === format.value
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-200"
                  : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                  }`}
              >
                <format.icon className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm font-medium">{format.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {format.description}
                </div>
              </button>
            ))}
          </div>
        </Field>

        {/* Data Inclusion Options */}
        <Field label="Include Data">
          <div className="space-y-2">
            <label className="flex items-center">
              <Checkbox
                checked={exportOptions.includeMembers}
                onChange={e =>
                  setExportOptions({
                    ...exportOptions,
                    includeMembers: e.currentTarget.checked,
                  })
                }
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Member information and roles</span>
            </label>
            <label className="flex items-center">
              <Checkbox
                checked={exportOptions.includeEvents}
                onChange={e =>
                  setExportOptions({
                    ...exportOptions,
                    includeEvents: e.currentTarget.checked,
                  })
                }
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Event details and schedules</span>
            </label>
            <label className="flex items-center">
              <Checkbox
                checked={exportOptions.includeSubscriptions}
                onChange={e =>
                  setExportOptions({
                    ...exportOptions,
                    includeSubscriptions: e.currentTarget.checked,
                  })
                }
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Event subscriptions and attendance</span>
            </label>
          </div>
        </Field>

        {/* Date Range */}
        <Field label="Date Range">
          <Select
            value={exportOptions.dateRange}
            onChange={e =>
              setExportOptions({
                ...exportOptions,
                dateRange: e.target.value as any,
              })
            }
            className="mb-3"
          >
            <option value="all">All time</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 90 days</option>
            <option value="custom">Custom range</option>
          </Select>

          {exportOptions.dateRange === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={exportOptions.customStartDate}
                  onChange={e =>
                    setExportOptions({
                      ...exportOptions,
                      customStartDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={exportOptions.customEndDate}
                  onChange={e =>
                    setExportOptions({
                      ...exportOptions,
                      customEndDate: e.target.value,
                    })
                  }
                />
              </div>
              {isCustomRangeInvalid && (
                <p className="col-span-2 text-sm text-red-600 dark:text-red-300">
                  Please select a valid date range where Start Date is before or equal to End Date.
                </p>
              )}
            </div>
          )}
        </Field>

        {/* Export Summary */}
        <Panel className="p-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Export Summary
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
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
        </Panel>

        <ActionRow>
          <Button type="button" variant="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExportDisabled}
            className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700"
          >
            {isLoading ? "Exporting..." : "Export Data"}
          </Button>
        </ActionRow>
      </div>
    </BaseModal>
  );
}
