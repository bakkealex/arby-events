import React from "react";

export default function SuccessMessage({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  if (!message) return null; // Don't render if no message is provided
  return (
    <div
      className={`flex bg-green-100 border rounded-lg border-green-400 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-200 items-center gap-2 p-4 my-2 ${className}`}
      role="alert"
    >
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.5 12.5l2 2 3-3"
        />
      </svg>
      <span className="font-medium">{message}</span>
    </div>
  );
}
