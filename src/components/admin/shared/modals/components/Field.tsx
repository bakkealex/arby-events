"use client";
import { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  help?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, help, className = "", children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {children}
      {help && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{help}</p>}
    </div>
  );
}
