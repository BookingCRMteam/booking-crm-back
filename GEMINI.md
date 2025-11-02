# Project Overview

This is a NestJS backend application for a Booking CRM. It is built with TypeScript and uses Drizzle ORM for database interactions. The project is configured to use PostgreSQL (inferred from Drizzle's `pg-core` usage). pnpm is used for package management. The application integrates with Stripe and LiqPay for payment processing. The project is also Dockerized for containerization.

# Building and Running

## Dependencies

Install dependencies using pnpm:

```bash
pnpm install
```

## Development

To run the application in development mode with hot-reloading:

```bash
pnpm run start:dev
```

To run the application in development mode using Docker:

```bash
pnpm run start:docker
```

## Building

To build the application for production:

```bash
pnpm run build
```

## Running in Production

To run the built application in production:

```bash
pnpm run start:prod
```

## Docker

To build and run the Docker containers (assuming `docker-compose.yml` is configured):

```bash
docker-compose up --build
```

## Database Migrations (Drizzle ORM)

*   **Generate a new migration:**
*   **Generate a new migration:**
```bash
pnpm run db:generate
```
*   **Apply migrations:**
*   **Apply migrations:**
```bash
pnpm run db:migrate
```
*   **Open Drizzle Studio:**
    ```bash
pnpm run db:studio
    ```
*   **Push schema to database:**
    ```bash
pnpm run db:push
    ```

## Testing

*   **Run all tests:**
    ```bash
pnpm run test
    ```
*   **Run tests in watch mode:**
    ```bash
pnpm run test:watch
    ```
*   **Run tests with coverage:**
    ```bash
pnpm run test:cov
    ```
*   **Run end-to-end tests:**
    ```bash
pnpm run test:e2e
    ```

## Linting and Formatting

*   **Lint and fix issues:**
    ```bash
pnpm run lint
    ```
*   **Format code:**
    ```bash
pnpm run format
    ```

## Seeding Data

*   **Seed countries:**
    ```bash
pnpm run seed:countries
    ```
*   **Seed cities:**
    ```bash
pnpm run seed:cities
    ```
*   **Seed tours from API:**
    ```bash
pnpm run seed:tours:api
    ```

# Development Conventions

*   **Coding Style:** Enforced with Prettier (`.prettierrc`) and ESLint (`eslint.config.mjs`).
*   **Pre-commit Hooks:** Husky is used to run linting and formatting checks before committing (`.husky/pre-commit`).
*   **Database Migrations:** Drizzle ORM is used for managing database schema changes.
