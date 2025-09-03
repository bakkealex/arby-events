"use client";
import { cn } from "@/lib/cn";
import { ComponentProps, forwardRef } from "react";

const base = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
const light = "border-gray-300 bg-white text-gray-900 placeholder-gray-500";
const dark = "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  (props, ref) => {
    const { className, ...rest } = props;
    return <input ref={ref} className={cn(base, light, dark, className)} {...rest} />;
  }
);
Input.displayName = "Input";

export function Textarea(props: ComponentProps<"textarea">) {
  const { className, ...rest } = props;
  return <textarea className={cn(base, light, dark, className)} {...rest} />;
}

export function Select(props: ComponentProps<"select">) {
  const { className, ...rest } = props;
  return <select className={cn(base, light, dark, className)} {...rest} />;
}

export function Checkbox(props: ComponentProps<"input">) {
  const { className, ...rest } = props;
  return (
    <input
      type="checkbox"
      className={cn("rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:checked:accent-blue-400", className)}
      {...rest}
    />
  );
}
