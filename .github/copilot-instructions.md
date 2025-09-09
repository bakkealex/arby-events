# Copilot Instructions for Arby Events

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a full-stack event management web application built with:

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, App Router
- **Backend**: Node.js API routes with Next.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js for multi-platform login
- **Hosting**: Vercel
- **Email**: Nodemailer for event notifications
- **Calendar**: ICS file generation for calendar integration
- **State management:** Use React state/hooks, optionally server actions – avoid unnecessary libraries

## 🛠 Technology Stack

- **Frontend:** Next.js 15 (latest version, App Router, Server Actions, API Routes) with TypeScript
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** MySQL with Prisma ORM
- **Auth:** NextAuth.js (latest version, multi-platform login support)
- **Styling:** Tailwind CSS (latest version) with dark mode support
- **Email:** Nodemailer for event notifications
- **Calendar:** ICS file generation for calendar integration
- **Hosting:** Vercel
- **State management:** Use React state/hooks, optionally server actions – avoid unnecessary libraries

## 🎨 Design System

**Design Guidelines:**

- Focus on clean, modern, and pretty design
- **Dark Mode Support:** All components and pages must support dark mode
- Use Tailwind CSS utilities for consistent styling
- Responsive design for mobile, tablet, and desktop
- Professional appearance suitable for European market
- The design should have its own unique identity and branding specified in a CSS file

**Dark Mode Implementation:**

- Use Tailwind's `dark:` prefix for dark mode variants
- Implement system preference detection and manual toggle
- Ensure proper contrast ratios for accessibility
- Test all components in both light and dark themes

**Dark Mode Class Patterns:**

When creating new components, always include dark mode variants using these standard patterns:

```tsx
// Basic background and text
className = "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white";

// Cards and containers
className =
  "bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700";

// Buttons
See `src/app/globals.css` for button styles and variants.

// Form inputs
className =
  "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

// Text colors
className = "text-gray-600 dark:text-gray-300"; // Secondary text
className = "text-gray-500 dark:text-gray-400"; // Muted text
className = "text-gray-700 dark:text-gray-200"; // Labels

// Interactive elements
className =
  "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400";
```

**Required Dark Mode Elements:**

- Every component must have `dark:` variants for backgrounds, text, and borders
- Use proper contrast ratios (WCAG AA compliance)
- No component should be created without dark mode support

## Key Features

- User authentication (email, OAuth providers)
- Group management (users can join/leave groups)
- Event creation and management
- Event subscriptions with email notifications
- Calendar file (.ics) download
- Responsive design for mobile, tablet, and desktop

## Code Guidelines

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement proper error handling and validation
- Use Prisma for database operations
- Follow security best practices for authentication
- Use React Server Components where appropriate
- Implement proper loading states and error boundaries
- Components should always be located in the `src/components` directory
- Types and Interfaces should be defined in the `src/types` directory
- The project should be as modular as possible, with clear separation of concerns and reusable components.

## API Structure

- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/groups/*` - Group management
- `/api/events/*` - Event management
- `/api/notifications/*` - Email notifications
- `/api/calendar/*` - ICS file generation

### Detailed API Endpoints

## Authentication Endpoints

```
POST   /api/auth/register           // User registration
POST   /api/auth/login              // User login
POST   /api/auth/logout             // User logout
POST   /api/auth/reset-password     // Password reset
```

## Core Resource Endpoints (RESTful CRUD)

### Users

```
GET    /api/users                   // List users (with filters)
POST   /api/users                   // Create user
GET    /api/users/[id]              // Get user details
PATCH  /api/users/[id]              // Update user
DELETE /api/users/[id]              // Delete user
```

### Groups

```
GET    /api/groups                  // List groups
POST   /api/groups                  // Create group
GET    /api/groups/[id]             // Get group details
PATCH  /api/groups/[id]             // Update group
DELETE /api/groups/[id]             // Delete group
```

### Events

```
GET    /api/events                  // List events
POST   /api/events                  // Create event
GET    /api/events/[id]             // Get event details
PATCH  /api/events/[id]             // Update event
DELETE /api/events/[id]             // Delete event
```

## User Action Endpoints

### Group Membership (User Actions)

```
POST   /api/groups/[id]/join        // Request to join group (user)
DELETE /api/groups/[id]/leave       // Leave group (user)
```

### Event Participation (User Actions)

```
POST   /api/events/[id]/subscribe   // Subscribe to event (user)
DELETE /api/events/[id]/unsubscribe // Unsubscribe from event (user)
GET    /api/events/[id]/calendar    // Download ICS file (user)
```

## Group Management Endpoints (Group Admin + Platform Admin)

### Group Members

```
GET    /api/groups/[id]/members                    // List group members
POST   /api/groups/[id]/members                    // Add member to group
DELETE /api/groups/[id]/members/[userId]           // Remove member from group
PATCH  /api/groups/[id]/members/[userId]           // Update member role
```

### Group Actions

```
POST   /api/groups/[id]/invite                     // Invite user to group
POST   /api/groups/[id]/notify                     // Send group notification
```

## Event Management Endpoints

### Event Information

```
GET    /api/events/[id]/subscribers                // Get event subscribers
```

## Group Administrator (Mod) Endpoints

```
GET    /api/mod/groups                             // Groups user administers
GET    /api/mod/groups/[id]/stats                  // Group statistics
```

## Platform Admin Endpoints

### Admin User Management

```
GET    /api/admin/users                            // List all users (admin view)
POST   /api/admin/users                            // Create user (admin)
GET    /api/admin/users/[id]                       // Get user details (admin)
PATCH  /api/admin/users/[id]                       // Update user (admin)
DELETE /api/admin/users/[id]                       // Delete user (admin)
GET    /api/admin/users/search                     // Search users (admin)
POST   /api/admin/users/send-credentials           // Send user credentials (admin)
```

### Admin Group Management

```
GET    /api/admin/groups                           // List all groups (admin view)
POST   /api/admin/groups/[id]/members              // Add member to group (admin)
DELETE /api/admin/groups/[id]/members/[userId]     // Remove member (admin)
PATCH  /api/admin/groups/[id]/members/[userId]     // Change member role (admin)
GET    /api/admin/groups/[id]/export               // Export group data (admin)
POST   /api/admin/groups/[id]/notifications        // Send group notification (admin)
```

### Admin Platform Management

```
GET    /api/admin/stats                            // Platform statistics (admin)
```

## Notification Endpoints

```
POST   /api/notifications/send                     // Send custom notification
GET    /api/notifications/[userId]                 // Get user notifications
```

## Calendar Endpoints

```
GET    /api/calendar/[eventId]                     // Generate ICS file for event
```

## Database Schema

- Users table (id, email, name, createdAt, updatedAt)
- Groups table (id, name, description, createdBy, createdAt)
- Events table (id, title, description, startDate, endDate, location, groupId, createdBy)
- UserGroups table (userId, groupId, role, joinedAt)
- EventSubscriptions table (userId, eventId, subscribedAt)

## Security Considerations

- Validate all inputs
- Sanitize database queries
- Implement proper authentication checks
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints

## GDPR Compliance

- Must be compliant with GDPR regulations
- User consent must be obtained for data processing
- Users have the right to access, modify, and delete their data
- Data breaches must be reported within 72 hours

## Pages

- `/admin` - Admin home page with statistics and management options (manage users, groups, events)
  - `/admin/users` - User management page for admins
  - `/admin/groups` - Group management page for admins
  - `/admin/events` - Event management page for admins
  - `/admin/settings` - Platform settings page for admins
- `/mod` - group administrator page for managing events, groups, users, and notifications
- `/events` - Event listing page for subscribed events for that user
- `/groups` - Group management page for the user
- `/profile` - User profile page for viewing and editing user information

## User rights and permissions

- Admins can:
  - Manage all users, groups, and events. Absolute control over the platform.
  - View and edit all user profiles
  - View and edit all group details
  - View and edit all event details
  - Manage notifications for all users
  - View platform-wide statistics
  - Manage platform settings
  - Add or remove Group Administrators to any group
  - Everything else that Group Administrators and users can do, but without any limitations
- Users can:
  - Subscribe to events
  - Leave and request to join groups
  - View their subscribed events and groups
  - Download calendar files for events
  - Receive email notifications for events they are subscribed to, including updates and reminders
  - Receive email notifications for new events in groups they are part of
  - View their profile and update their information
  - Manage their account settings (password reset, email preferences)
  - View their event history and past subscriptions
  - View group details and members
  - View notifications and announcements from groups they are part of
  - Deactivate their account if needed plus request account deletion
- Group Administrators (see more details in Groups) can:
  - Manage events: Add and remove events, edit event details for their groups
  - Manage groups: Add, remove, and invite users to the group
  - Manage users: Limited to their groups (limited; view details, reset passwords, deactivate but not delete)
  - Add or remove group administrators: Promote or demote users to/from group administrator status within their groups
  - Manage notifications: Send notifications to users in their groups
  - View statistics: View statistics for their groups
  - Everything else that admins can do, but limited to their groups
  - Everything else that users can do, but limited to their groups

## Groups

- Group administrators can create and manage groups, including adding and removing members.
- Users can request to join and leave groups, and view group details.
- Each group has a unique ID, name, description, and a list of members.
- Groups have group administrators who can manage the group and its members.
- Each group may have multiple group administrators.
- A group administrator may be group administrator in one group, but not in another group.
- Users may not create groups.
- Groups can be hidden from users that are not members, but visible to site administrators.

## User registration

- A user can register for an account by providing their email address, name, and password.
- Upon successful registration, the user will receive a confirmation email to verify their email address.
- Users must verify their email address before they can log in to the platform.
- After verification, users can log in and access their account.
- However, if a user fails to verify their email address within a certain timeframe, their account may be suspended or deleted.
- A user may not access anything else on the platform until an administrator (or group administrator) approves their account. The account will automatically be deleted if not approved within the specified timeframe (1 year after registration).
- An administrator (or group administrator) must manually approve the user's account before they can access the platform. If the administrator (or group administrator) denies the request, the user will be notified and their account will be deactivated.

## 🔒 GDPR Compliance

- Must be compliant with GDPR regulations for European market
- User consent must be obtained for data processing with version tracking
- Users have the right to access, modify, and delete their data
- Data breaches must be reported within 72 hours
- Implement explicit consent tracking with `gdprConsentVersion` and `gdprConsentDate`
- Provide clear privacy policy and data usage information
- Users can request data export and account deletion
- Track consent versions for future updates to privacy policies

## 💼 Developer Preferences

**Context:**

- I work primarily with JavaScript/TypeScript, Node.js, React and Next.js
- My projects are often minimalistic MVP deliveries for clients, with clear scope and focus on easy further development
- Code I get from Copilot should be practical, runnable and easy to adapt
- I prefer structured code with clear separation of components and logic
- Use modern ES standards, functional components and hooks where appropriate

**Style & formatting:**

- Follow ESLint standards (airbnb-style or similar) with 2 spaces indentation
- Use `async/await` instead of `.then()` where possible
- For React/Next.js: always use functional components and named exports
- Add short comments only where code needs explanation – don't over-explain

**Specific wishes:**

- When you suggest code: always give filename/structure suggestions ("create a file called X in /components")
- When I ask for functionality: also suggest relevant npm packages and how to install them
- Avoid unnecessary complexity – implement with fewest possible dependencies unless I specify otherwise
- Feel free to show small, isolated code pieces before entire components, so we can iterate

**Interaction:**

- If a problem can be solved in multiple ways, present 2–3 alternatives with pros/cons
- Don't assume – ask a short clarifying question before writing lots of code if the specification is unclear
- Suggest best practices for security and performance, especially around authentication, data storage and GDPR

**Scope protection:**

- When we work with a project with defined MVP: Don't add "extra features" unless I have asked for them
- Minor improvements/optimizations can be suggested in a separate section called **Possible improvements**

## 🧠 Instructions to Copilot

- **Types**: Define in external files in `/types` - not inline interfaces
- **File structure**: Follow established pattern with `/app` for pages and `/lib` for utilities
- **API Routes**: Place in `/app/api` with proper error handling and type safety
- **GDPR**: Remember version tracking and consent validation for new features
- **Dark Mode**: Ensure all components support dark mode with proper contrast
- **Terminal**: Do not start a new terminal and to run commands from there. There should always be a terminal running the app.
- Use TypeScript and functional components
- If you suggest improvements, put them in a separate section called "Possible extensions"
- When writing placeholder emails, use a consistent format (e.g., `user+timestamp@bakke.me`), so it doesn't send emails to real users.

**When you suggest code:**

1. Brief summary of solution
2. Suggested code structure with filenames (English names)
3. Code example with correct patterns and dark mode support
4. "Possible extensions" section if relevant

## 🔒 Security & Best Practices

- Server-side sessions validation with `getServerSession(authOptions)`
- Role-based authorization on both frontend and API level
- Prisma queries with proper select/include for performance
- Environment variables for sensitive config (not hardcoded values)
- GDPR compliance with explicit consent tracking
- Implement proper error handling and validation
- Use React Server Components where appropriate
- Implement proper loading states and error boundaries

**Example authorization:**

```tsx
const session = await getServerSession(authOptions);
if (!session || session.user.role !== UserRole.ADMIN) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```
