"use client";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import type { PageHeaderProps } from "@/types";

export default function AdminHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="px-6 py-4">
        {/* Breadcrumbs */}
        <Breadcrumbs customItems={breadcrumbs} className="mb-4" />

        {/* Header Content */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center space-x-3">{actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}
