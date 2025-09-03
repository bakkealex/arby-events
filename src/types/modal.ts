/**
 * Modal related types and configurations
 */

// Base modal configuration
export type BaseModalConfig = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  persistent?: boolean;
};

// Modal button configuration
export type ModalButton = {
  label: string;
  variant: "primary" | "secondary" | "danger" | "ghost";
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
};

// Confirmation modal data
export type ConfirmationModalData = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "warning" | "danger" | "info";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

// Form modal types
export type FormModalState = "idle" | "submitting" | "success" | "error";

export type FormModalConfig<T = any> = BaseModalConfig & {
  initialData?: T;
  onSubmit: (data: T) => Promise<void>;
  validationSchema?: any; // Zod schema or similar
  submitText?: string;
  cancelText?: string;
};

// Export data modal configuration
export type ExportModalConfig = {
  open: boolean;
  onClose: () => void;
  entityType: "users" | "groups" | "events";
  entityId?: string;
  format?: "csv" | "json" | "pdf";
  includeRelated?: boolean;
};

// Delete confirmation types
export type DeleteTarget = {
  type: "user" | "group" | "event";
  id: string;
  name: string;
  dependencies?: string[]; // Related items that will be affected
};

// Modal size configurations
export type ModalSizeConfig = {
  width: string;
  maxWidth: string;
  height?: string;
  maxHeight?: string;
};
