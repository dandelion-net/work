# Dandelion Board

A modern, feature-rich discussion platform built with Next.js, Prisma, and TypeScript. This application allows users to share problems, propose solutions, and engage in meaningful discussions with community moderation features.

## Features

- 🔐 **Authentication & Authorization**
  - Email-based authentication
  - Role-based access control (User/Admin)
  - Protected routes and API endpoints

- 💬 **Content Management**
  - Create and share problems
  - Submit solutions to problems
  - Vote on problems and solutions
  - Rich text formatting
  - Content moderation system

- 👥 **User Features**
  - User profiles
  - Activity tracking
  - Contribution history
  - Customizable settings

- 🛠 **Admin Dashboard**
  - User management
  - Content moderation
  - Activity monitoring
  - Webhook configuration
  - System analytics

- 🔍 **Search & Discovery**
  - Full-text search
  - Advanced filtering
  - Sort by various criteria
  - Pagination support

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark mode support
  - Accessible components
  - Real-time updates

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **API**: REST API with Next.js API routes
- **Validation**: Zod
- **Icons**: Lucide React

## Prerequisites

- Node.js 18 or later
- PostgreSQL database
- OIDC provider (for authentication)

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables in `.env`:
   ```env
   # Database Configuration
   DATABASE_PROVIDER="postgresql"
   DATABASE_URL="postgresql://user:password@localhost:5432/discussion_board"

   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   OIDC_ISSUER="https://your-oidc-provider"
   OIDC_CLIENT_ID="your-client-id"
   OIDC_CLIENT_SECRET="your-client-secret"

   # Webhook Configuration
   WEBHOOK_SECRET="your-webhook-secret"
   ```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

3. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Docker Deployment

1. Build the Docker image:
   ```bash
   npm run docker:build
   ```

2. Start the containers:
   ```bash
   npm run docker:compose
   ```

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── components/        # React components
│   └── ...               # Other app routes
├── lib/                   # Utility functions and shared code
├── prisma/               # Database schema and migrations
└── supabase/             # Supabase configurations
```

## API Documentation

### Authentication

- `POST /api/auth/signin`: Sign in with email/password
- `GET /api/auth/session`: Get current session

### Problems

- `GET /api/problems`: List problems
- `POST /api/problems`: Create problem
- `GET /api/problems/[id]`: Get problem details
- `PATCH /api/problems/[id]`: Update problem
- `DELETE /api/problems/[id]`: Delete problem

### Solutions

- `POST /api/solutions`: Create solution
- `PATCH /api/solutions/[id]`: Update solution
- `DELETE /api/solutions/[id]`: Delete solution

### Votes

- `POST /api/votes`: Create/update vote
- `POST /api/weighted-votes`: Create weighted vote

### Admin

- `GET /api/users`: List users
- `PATCH /api/users/[id]`: Update user
- `GET /api/activity`: Get activity logs
- `GET /api/moderation`: Get content for moderation
- `POST /api/moderation/[id]`: Moderate content
- `GET /api/webhooks`: List webhooks
- `POST /api/webhooks`: Create webhook
- `PATCH /api/webhooks/[id]`: Update webhook
- `DELETE /api/webhooks/[id]`: Delete webhook

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.