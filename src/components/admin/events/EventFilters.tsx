"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useDebounce } from "@/hooks/useDebounce";
import GroupMultiSelect from "./GroupMultiSelect";

type TimeFilter = "upcoming" | "past" | "all";
type SortOption =
  | "date-desc"
  | "date-asc"
  | "title-asc"
  | "title-desc"
  | "subscribers-desc";

interface EventFiltersProps {
  groups: Array<{ id: string; name: string }>;
  totalCounts: {
    upcoming: number;
    past: number;
    all: number;
  };
}

export default function EventFilters({
  groups,
  totalCounts,
}: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(
    (searchParams.get("time") as TimeFilter) || "upcoming"
  );
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    searchParams.get("groups")?.split(",").filter(Boolean) || []
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "date-desc"
  );
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (timeFilter !== "upcoming") params.set("time", timeFilter);
    if (selectedGroups.length > 0)
      params.set("groups", selectedGroups.join(","));
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
    if (sortBy !== "date-desc") params.set("sort", sortBy);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/admin/events${newUrl}`, { scroll: false });
  }, [timeFilter, selectedGroups, debouncedSearchQuery, sortBy, router]);

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const clearFilters = () => {
    setTimeFilter("upcoming");
    setSelectedGroups([]);
    setSearchQuery("");
    setSortBy("date-desc");
  };

  const hasActiveFilters =
    timeFilter !== "upcoming" ||
    selectedGroups.length > 0 ||
    debouncedSearchQuery ||
    sortBy !== "date-desc";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Time Filter Tabs */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { key: "upcoming", label: "Upcoming", count: totalCounts.upcoming },
            { key: "past", label: "Past", count: totalCounts.past },
            { key: "all", label: "All Events", count: totalCounts.all },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTimeFilter(key as TimeFilter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeFilter === key
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showFilters || hasActiveFilters
            ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
        >
          <FunnelIcon className="h-4 w-4" />
          Filters{" "}
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-2 h-2"></span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Events
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full pl-10 pr-4 h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Groups ({selectedGroups.length} selected)
            </label>
            <GroupMultiSelect
              groups={groups}
              selectedGroups={selectedGroups}
              onChange={(ids) => setSelectedGroups(ids)}
              maxHeight="max-h-56"
            />
            {/*
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {groups.map(group => (
                <label key={group.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => handleGroupToggle(group.id)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {group.name}
                  </span>
                </label>
              ))}
            </div> */}
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="subscribers-desc">Most Subscribers</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
