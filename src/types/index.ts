/**
 * Central exports for all types used in the application
 */

// Database types from Prisma
export * from "./DatabaseTypes";

// Core application types
export * from "./auth";
export * from "./common";
export * from "./dashboard";

// Admin specific types (excluding conflicts)
export type {
  AdminUserView,
  AdminGroupView,
  AdminPageProps,
  AdminUserManagementProps,
  AdminGroupManagementProps,
  AdminSettings,
  ActivityLog,
} from "./admin";

// API types (excluding conflicts)
export type {
  ApiError,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  EmailVerificationRequest,
  EmailVerificationResponse,
  UserCreateRequest,
  UserUpdateRequest,
  GroupCreateRequest,
  GroupUpdateRequest,
  GroupMemberRequest,
  EventCreateRequest,
  EventUpdateRequest,
  EventSubscriptionRequest,
} from "./api";

// Event types (excluding conflicts with DatabaseTypes)
export type {
  EventWithDetails,
  NotificationSettings,
  EventFormData,
  EventCalendarData,
  EventFilters,
  EventListItem,
} from "./events";

// Component props
export type {
  BaseProps,
  PageHeaderProps,
  BreadcrumbsProps,
  LoadingSpinnerProps,
  ErrorMessageProps,
  SuccessMessageProps,
  AnimatedEllipsisProps,
  FormInputProps,
  FormTextareaProps,
  FormSelectProps,
  FormCheckboxProps,
  ButtonProps,
} from "./props";

// UI types
export type {
  Breadcrumb,
  Message,
  ErrorMessage,
  SuccessMessage,
  MenuItem,
  TableColumn,
  Filter,
  SearchConfig,
  Notification,
  LoadingSpinner,
  FormField,
} from "./ui";

// Modal types
export * from "./modal";
