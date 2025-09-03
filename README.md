# Arby Events - Event Management Platform

A full-stack web application for managing events and group memberships with email notifications and calendar integration.

## Features

- **User Authentication**: Multiple login options (email/password, Google, GitHub)
- **Group Management**: Create and join groups, manage memberships
- **Event Management**: Create, edit, and subscribe to events
- **Email Notifications**: Automatic notifications for new/updated events
- **Calendar Integration**: Download .ics files for calendar apps
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **Calendar**: ICS file generation

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

The application uses the following main entities:

- **Users**: Authentication and profile information
- **Groups**: Organization units for events
- **Events**: Event details and scheduling
- **UserGroups**: Group membership relationships
- **EventSubscriptions**: User event subscriptions

## API Endpoints

- `/api/auth/*` - Authentication (NextAuth.js)
- `/api/users/*` - User management
- `/api/groups/*` - Group operations
- `/api/events/*` - Event management
- `/api/notifications/*` - Email notifications
- `/api/calendar/*` - ICS file generation

## Development

To start development:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Production Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

Make sure to:

- Set up a production database
- Configure proper SMTP settings
- Set secure environment variables
- Set up OAuth provider credentials

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
