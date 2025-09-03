/**
 * Component props interfaces
 */

import { Breadcrumb, LoadingSpinner } from "./ui";

// Base component props
export interface BaseProps {
  className?: string;
}

// Layout components
export interface PageHeaderProps extends BaseProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

// Navigation components
export interface BreadcrumbsProps extends BaseProps {
  customItems?: Breadcrumb[];
}

// UI components
export interface LoadingSpinnerProps extends LoadingSpinner, BaseProps {
  // Extends LoadingSpinner
}

export interface ErrorMessageProps extends BaseProps {
  message: string;
  code?: string;
  details?: string;
  onRetry?: () => void;
}

export interface SuccessMessageProps extends BaseProps {
  message: string;
  action?: string;
  duration?: number;
  onDismiss?: () => void;
}

export interface AnimatedEllipsisProps extends BaseProps {
  size?: "sm" | "md" | "lg";
}

// Form components with dark mode support
export interface FormInputProps extends BaseProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helpText?: string;
}

export interface FormTextareaProps extends BaseProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helpText?: string;
}

export interface FormSelectProps extends BaseProps {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helpText?: string;
}

export interface FormCheckboxProps extends BaseProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  helpText?: string;
}

// Button components with dark mode support
export interface ButtonProps extends BaseProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}
