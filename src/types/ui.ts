/**
 * UI component types and interfaces
 */

// Base component props
export interface BaseProps {
  className?: string;
}

// Breadcrumb navigation
export interface Breadcrumb {
  label: string;
  href?: string;
  current?: boolean;
}

// Message interfaces
export interface Message {
  message: string;
}

export interface ErrorMessage extends Message {
  code?: string;
  details?: string;
}

export interface SuccessMessage extends Message {
  action?: string;
  duration?: number;
}

// Navigation menu item
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
  children?: MenuItem[];
}

// Table column configuration
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => React.ReactNode;
  headerRender?: () => React.ReactNode;
}

// Filter configuration
export interface Filter {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "dateRange" | "multiSelect";
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: any;
}

// Search configuration
export interface SearchConfig {
  placeholder: string;
  fields: string[]; // Fields to search in
  debounceMs?: number;
  minLength?: number;
}

// Notification toast
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

// Loading spinner configuration
export interface LoadingSpinner {
  size?: "sm" | "md" | "lg";
  color?: string;
  text?: string;
  overlay?: boolean;
}

// Form field configuration
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "file";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  helpText?: string;
  errorText?: string;
}
