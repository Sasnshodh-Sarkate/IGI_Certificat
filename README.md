# IGS Certificate Management Project

This is a monorepo project built with **NestJS**, **Next.js**, **Shadcn/UI**, **TypeORM**, and **BullMQ**.

## Project Structure

- `apps/server`: NestJS backend.
- `apps/web`: Next.js frontend with Shadcn/UI.

## Prerequisites

1.  **Node.js**: Version 18 or higher is recommended.
2.  **SQLite**: Handled automatically by TypeORM (no installation needed).
3.  **Redis**: Required for BullMQ background jobs. Since Docker is not used, you must have Redis installed locally (via WSL2 or Memurai) or use a managed service like Upstash.

## Getting Started

### 1. Install Dependencies

From the root directory:

```bash
npm install
```

### 2. Configure Redis

Open `apps/server/.env` and ensure your Redis connection details are correct:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Run the Project in Development Mode

```bash
npm run dev
```

This will start:
- Backend: [http://localhost:3001](http://localhost:3001)
- Frontend: [http://localhost:3000](http://localhost:3000)

## Features

- **Monorepo**: Managed with npm workspaces.
- **SQLite + TypeORM**: Persistence for certificate data.
- **BullMQ Status Updates**: Asynchronous job processing for status changes.
- **Shadcn/UI**: Modern frontend components.
