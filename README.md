# Memora

Memora is a fullstack study planner application for organizing learning tasks, tracking progress and managing study sessions.

The project combines a Next.js frontend with an Express API, Prisma and PostgreSQL.

## Main Features

- User registration and login
- JWT-based authentication
- Dashboard for study planning
- Task creation and management
- Backend validation with Zod
- Prisma-based database access
- Separate frontend and backend apps

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT authentication

## Repository Structure

```text
apps/
  web/   # Next.js frontend
  api/   # Express backend with Prisma
```

The project is organized as a small monorepo with separate applications for the user interface and the API.

## Prerequisites

Before running the project, install:

- Node.js
- npm
- PostgreSQL

A local PostgreSQL database is required for the API.

## Backend Setup

```bash
cd apps/api
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

The backend starts the Express API in development mode.

## Frontend Setup

```bash
cd apps/web
npm install
npm run dev
```

The frontend is available at:

```text
http://localhost:3000
```

## Environment Variables

The API requires environment variables for the database connection and JWT signing.

See `apps/api/.env.example` for a template.
