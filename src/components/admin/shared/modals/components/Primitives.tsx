"use client";
import { cn } from "@/lib/cn";
import { ComponentProps, ReactNode } from "react";
import { success } from "zod/v4";

export function Button({ variant = "primary", className, ...rest }: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "danger" | "neutral" | "warning" | "success" }) {
  const variants = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    success: "btn btn-success",
    warning: "btn btn-warning",
    danger: "btn btn-danger",
    neutral: "btn btn-neutral",
  } as const;
  return <button className={cn("text-sm font-medium rounded-md disabled:opacity-50", variants[variant], className)} {...rest} />;
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md p-4", className)}>
      {children}
    </div>
  );
}

export function Badge({ color = "gray", children }: { color?: "gray" | "blue" | "green" | "yellow" | "red"; children: ReactNode }) {
  const map: Record<string, string> = {
    gray: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
    blue: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-700",
    green: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-200 dark:border-green-700",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-700",
    red: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-200 dark:border-red-700",
  };
  return <span className={cn("px-2 py-1 text-xs rounded-full border font-medium", map[color])}>{children}</span>;
}

export function ActionRow({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex justify-end space-x-3 pt-4", className)}>{children}</div>;
}
