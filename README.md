# MakerFlow

MakerFlow is a full-stack platform for **content agencies** and their clients. It brings the
whole short-form video workflow into one place: writing scripts, reviewing and approving videos,
publishing, and tracking social media performance — all organized per project.

## What it does

- **Agencies & projects** — Each agency is a workspace that owns its projects, billing,
  integrations and team. Work is always scoped to a project.
- **Roles & client portal** — Admins, editors and viewers collaborate on the agency side;
  clients are invited into a dedicated portal to review and approve their content.
- **Scripts** — Write video scripts line by line with AI-powered per-line suggestions, reusable
  hook templates, and search.
- **Review workflow** — Agencies upload video versions; clients watch (HLS streaming) and approve
  or leave threaded comments, looping until the content is signed off.
- **Contents** — Browse posts and auto-grouped post groups per project, filtered by platform.
- **Social analytics** — Connect Instagram, YouTube and TikTok via OAuth and pull insights at the
  integration and per-post level, with KPIs, evolution and timeline charts on the home dashboard.
- **Billing** — Stripe-driven subscriptions and a credit system for usage-based features.
- **Account & onboarding** — Email/password auth with OTP (2FA + email verification), invitations,
  a role-aware onboarding wizard, and a prelaunch referral page.

The interface is available in French and English (i18n).

## Tech Stack

- **Frontend**: React 19, React Router DOM 7, TypeScript, Tailwind CSS 4, Zustand, React Query,
  Recharts, Vite 7
- **Backend**: Symfony 7.3, PHP 8.2, Doctrine ORM, MySQL 8.0, Redis, RabbitMQ (Symfony Messenger)
- **Infrastructure**: Docker Compose (front, back, db, redis-store, rabbitmq, pma)

## Getting Started

All services run via Docker Compose. Backend commands run inside the `back` container using
`dce` (alias for `docker compose exec`).

```bash
# Start all services
docker compose up

# Backend (Symfony)
dce back composer install                               # Install PHP dependencies
dce back php bin/console doctrine:migrations:migrate    # Run migrations
dce back php bin/console messenger:consume              # Start the async worker

# Frontend
dce front npm run dev          # Dev server with HMR
dce front npm run build        # Production build
dce front npm run typecheck    # TypeScript type checking
```

**Ports**: Frontend 3000, Backend 80, MySQL 3306, phpMyAdmin 8081, Redis 6379,
RabbitMQ 5672 (management 15672)

## Documentation

- **Frontend** — [`front/docs/`](front/docs/README.md) (coding style, UI guidelines, feature docs)
- **Backend** — [`back/docs/`](back/docs/README.md) (coding style, feature docs, messaging patterns)
- **Project guidance for contributors** — [`CLAUDE.md`](CLAUDE.md)
