# Arby Events - Event Management Platform

> ⚠️ **Work in Progress** - This project is currently under active development and is not feature-complete.

A modern, full-stack event management web application designed for organizations and communities to efficiently manage events, group memberships, and user communications with automated notifications and calendar integration.

## Overview

Arby Events provides a comprehensive platform for event management with a focus on user experience, administrative control, and GDPR compliance. The platform features a hybrid architecture that optimizes performance for both end-users and administrators.

### Key Features

- **Multi-Platform Authentication**: Secure login with email/password, Google, and GitHub integration
- **Advanced Group Management**: Create and manage groups with role-based permissions and visibility controls
- **Comprehensive Event Management**: Full event lifecycle management with subscription system
- **Automated Email Notifications**: Smart notifications for event updates, reminders, and group communications
- **Calendar Integration**: Native .ics file generation for seamless calendar app integration
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices with full dark mode support
- **Administrative Dashboard**: Powerful admin interface for platform-wide management
- **GDPR Compliance**: Built-in privacy controls and data management features

### User Roles & Permissions

- **Site Administrators**: Full platform control and management capabilities
- **Group Administrators**: Manage specific groups, events, and members within their assigned groups
- **Users**: Subscribe to events, join groups, and manage personal preferences

### Architecture Highlights

- **Hybrid Data Access**: Direct database queries for admin interfaces, API endpoints for user interactions
- **Visibility System**: Granular control over group and event visibility
- **Role-Based Security**: Multi-layered authorization system
- **Modern Tech Stack**: Built with Next.js 15, TypeScript, and Tailwind CSS

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and App Router
- **Backend**: Next.js API Routes with Prisma ORM
- **Database**: MySQL with comprehensive schema design
- **Authentication**: NextAuth.js with multi-provider support
- **Email**: Nodemailer integration for notifications
- **Calendar**: ICS file generation and export
- **Hosting**: Optimized for Vercel deployment

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database
- SMTP email service (Gmail, etc.)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd arby-events
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - Database connection string
   - NextAuth secret
   - OAuth provider credentials (optional)
   - SMTP email settings

4. Set up the database:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: Authentication, profile information, and role management
- **Groups**: Organization units for events with visibility controls
- **Events**: Event details, scheduling, and visibility settings
- **UserGroups**: Group membership relationships with role assignments
- **EventSubscriptions**: User event subscriptions and participation tracking
- **Notifications**: Email notification management and delivery tracking
- **EmailLogs**: Comprehensive email delivery tracking for GDPR compliance

### Visibility System

The platform implements a sophisticated visibility system:

- **Hidden groups** are visible to: group admins, site admins
- **Hidden events** are visible to: attendees, group admins, site admins
- **Visible content** is accessible to all authenticated users with appropriate permissions

## API Architecture

The platform uses a hybrid architecture approach:

### User-Facing APIs

- `/api/auth/*` - Authentication endpoints (NextAuth.js)
- `/api/groups/*` - User group interactions (join/leave/list)
- `/api/events/*` - User event interactions (subscribe/unsubscribe)
- `/api/notifications/*` - Email notifications
- `/api/calendar/*` - ICS file generation

### Admin Operations

- Admin pages use direct database access via shared services for optimal performance
- Complex admin queries and aggregations bypass API layer
- Shared business logic in `/lib/admin/` and `/lib/shared/` directories

## Security & Compliance

- **Role-Based Authorization**: Multi-layered security with user, group admin, and site admin roles
- **GDPR Compliance**: Built-in privacy controls, consent tracking, and data export capabilities
- **Input Validation**: Comprehensive validation using Zod schemas
- **Session Management**: Secure session handling with NextAuth.js
- **Database Security**: Parameterized queries and proper access controls

## Copyright

© 2025 Alexander Bakke ([github.com/bakkealex](https://github.com/bakkealex)). All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software is strictly prohibited.
