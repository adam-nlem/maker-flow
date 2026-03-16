# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MakerFlow is a full-stack web application for social media analytics (Instagram, YouTube) and task management. Features (TodoList, Insights) are built-in and always available per project.

## Tech Stack

- **Frontend**: React 19, React Router DOM 7, TypeScript, Tailwind CSS 4, Zustand, React Query, Recharts, Vite 7
- **Backend**: Symfony 7.3, PHP 8.2, Doctrine ORM, MySQL 8.0, Redis, RabbitMQ (Symfony Messenger)
- **Infrastructure**: Docker Compose (front, back, db, redis-store, rabbitmq, pma)

## Commands

All backend commands run inside Docker using `dce` (alias for `docker compose exec`):

```bash
# Start all services
docker compose up

# Backend (Symfony)
dce back php bin/console <command>         # Run any Symfony console command
dce back php bin/console doctrine:migrations:migrate   # Run migrations
dce back php bin/console cache:clear       # Clear cache
dce back php bin/console messenger:consume # Start async message worker
dce back composer install                  # Install PHP dependencies

# Frontend (runs in node container, but npm scripts also work locally)
dce front npm run dev          # Dev server with HMR (port 3000)
dce front npm run build        # Production build
dce front npm run typecheck    # TypeScript type checking
```

**Ports**: Frontend 3000, Backend 80, MySQL 3306, phpMyAdmin 8081, Redis 6379, RabbitMQ 5672 (management 15672)

## Architecture

### Feature Organization

Features are organized in a flat structure across both frontend and backend. Current features: **Insights** (Instagram/YouTube analytics) and **Tasks** (todo list management).

**Backend structure** (`back/src/`):
- `Controller/` -- API endpoints (e.g., `PostController`, `TodoListController`, `IntegrationInsightController`)
- `Entity/` -- Doctrine entities (e.g., `Post`, `PostInsight`, `TodoList`)
- `Repository/` -- Data access
- `Service/` -- Business logic
- `DTO/` -- Data transfer objects (Request, Response, QueryParam, External)
- `Message/` + `Handler/` -- Async RabbitMQ messages
- `Command/` -- CLI commands
- `Event/` + `EventSubscriber/` -- Domain events and subscribers
- `Helper/` -- Static utility classes

**Frontend structure** (`front/app/`):
- `components/` -- UI components organized by feature (`insights/`, `tasks/`, `projects/`, `sidebar/`, `ui/`)
- `hooks/api/` -- React Query hooks organized by resource (`posts/`, `integrations/`, `projects/`, `todoLists/`)
- `stores/` -- Zustand stores organized by domain (`project/`, `insights/`, `sidebar/`)
- `models/` -- TypeScript classes and enums
- `routes/` -- Route page components
- `services/` -- External services (HTTP client)

### Backend Patterns

- **DTOs layered by purpose**: `DTO/Request/`, `DTO/Response/`, `DTO/QueryParam/`, `DTO/External/` (third-party API shapes)
- **Serialization Groups** on entities for flexible API responses (e.g., `#[Groups(['api_user_me'])]`)
- **UUIDs** as entity identifiers via Symfony UID
- **Event-driven**: `IntegrationCreatedEvent` dispatched when OAuth completes; subscribers react
- **Async processing**: Long tasks (insight fetching) dispatched via RabbitMQ with `#[AsMessage]` / `#[AsMessageHandler]`
- **Scoping by project**: Features are scoped to projects via `projectUuid`

### Frontend Patterns

- **React Query hooks**: Each resource has a query keys file and custom hooks (e.g., `useShowIntegrationDetail`)
- **Zustand stores**: Client state for UI concerns (focused project, sidebar, modals, filters)
- **Client-side SPA**: Plain Vite + React with `react-router-dom` for routing, no SSR
- **Axios HTTP client**: Centralized in `front/app/services/httpClient/`

### API Routes

Key API routes (no `/modules/` prefix):
- `/api/projects` -- Project CRUD
- `/api/todo-lists` -- Todo list management
- `/api/posts` -- Post listing
- `/api/post-groups` -- Post groups
- `/api/integration-insights` -- Integration insight aggregation
- `/api/post-insights` -- Post insight detail
- `/api/integrations` -- OAuth integrations

### Frontend Routes

- `/` -- Home/Dashboard
- `/tasks` -- Tasks page
- `/insights` -- Insights page
- `/insights/posts/:postUuid` -- Post detail page

### Shared Conventions

- REST API consumed by frontend hooks
- Consistent pagination across API and UI
- TypeScript strict mode on frontend; PHP 8.2 typed properties on backend

## Documentation

Always consult before making changes:

- **Frontend docs**: `front/docs/` -- coding style, UI style guidelines, feature docs
- **Backend docs**: `back/docs/` -- coding style, feature docs, messaging patterns
- **UI guidelines**: `front/docs/ui-style-guidelines.md` -- design system, colors, typography, component catalog (must read before any frontend UI work)
- **Coding styles**: `front/docs/coding-style.md` and `back/docs/coding-style.md`

After completing a task, update or create relevant documentation in `front/docs/` or `back/docs/` and update their `README.md` index if needed.

## Key Rules

- Never write code unless I explicitly told you to do so.
- Use tailwind classes; do not write raw css.
- You are a master in TailwindCSS MySQL Symfony PHP and ReactJS. You write very clean code, simple code, respecting the best practices like separation of concerns and KISS. You write code that is easy to read and understand. More importantly, you write code based on you understanding of the actual codebase and codestyle : you respect the way of naming things, separating things and documenting things.
- Never start fixing bugs or adding new features unless that's what I EXPLICITLY told you to do.
- Don't generate code until you are at least 95% sure of what you are doing. When the feature is large (not a simple fix or small change), ask questions in order to improve that confidence score.
- Before analyzing/asking questions/starting a task, always check the relevant documentation files in the front/docs and back/docs directories. You can check the available documentations by reading README.md.
- Before doing a front-end change, always check the ui-style-guidelines.md file.
- When you complete a task, always generate/keep up-to-date the relevant documentation files in front/docs for frontend and back/docs for backend and create the file if it doesn't exist and update the README.md file if needed.
- Commands should be executed in docker containers like this "dce back [command]"
