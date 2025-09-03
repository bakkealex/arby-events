/**
 * Common utility types used across the application
 */

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Loading and error states
export type LoadingState = "idle" | "loading" | "success" | "error";

// API response wrapper
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
};

// Pagination types
export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationInfo;
};

// Sort and filter types
export type SortOrder = "asc" | "desc";
export type SortField = string;

export type SortConfig = {
  field: SortField;
  order: SortOrder;
};

// Date range type
export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

// File upload types
export type FileUploadStatus = "pending" | "uploading" | "success" | "error";

// Notification types
export type NotificationType = "success" | "error" | "warning" | "info";

// Tab types
export type TabConfig = {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
};

// Simplified user for lightweight references
export type SimpleUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};
