# Backend Documentation

Index of all available documentation for the backend codebase (Symfony, PHP).

## Documentation Index

| File | Description | Scope |
|------|-------------|-------|
| [coding-style.md](coding-style.md) | Coding standards and conventions | Project structure, naming conventions, controllers, entities (UUIDs, timestamps, serialization groups), enums, DTOs, repositories, services, helpers, API response patterns, Redis key naming, pagination, best practices |
| [integration-events-feature.md](integration-events-feature.md) | Event-driven integration lifecycle | Symfony EventDispatcher, `IntegrationCreatedEvent`, event subscribers, decoupled reactions to integration events, naming conventions |
| [integration-oauth-feature.md](integration-oauth-feature.md) | OAuth 2.0 backend flow | Instagram Authorization Code Flow, token management, Integration entity, security (CSRF state, Redis), API endpoints (create, callback, list, show, delete), external DTOs, adding new providers |
| [project-feature.md](project-feature.md) | Project management backend | Project entity, `ProjectType` enum, CRUD endpoints, 7 serialization groups, unique constraint (name + user), cascade delete behavior, pagination |
| [rabbitmq-messenger-feature.md](rabbitmq-messenger-feature.md) | Asynchronous processing | RabbitMQ broker, Symfony Messenger, Docker services, transport configuration, message/handler patterns (`#[AsMessage]`, `#[AsMessageHandler]`), retry strategy, worker management, troubleshooting |
| [social-analytics-insight-fetch-feature.md](social-analytics-insight-fetch-feature.md) | Instagram & YouTube insights fetching | Async commands via RabbitMQ, integration-level and post-level insights, Instagram Graph API, YouTube Reporting API (bulk CSV reports), InsightValueFormat enum, breakdown storage, metric mappings, deduplication logic, token refresh, error handling |
| [social-analytics-integration-detail-feature.md](social-analytics-integration-detail-feature.md) | Integration detail endpoint | `GET /api/integration-insights/detail`, aggregated insights with evolution, daily points with totalValue, streak, post count |
| [social-analytics-posts-list-feature.md](social-analytics-posts-list-feature.md) | Posts list endpoint | `GET /api/posts`, paginated posts with insights, evolution percentage calculations, time period filtering, DTOs, insight evolution helper |
| [script-feature.md](script-feature.md) | Script system for content planning | Script entity, ScriptTag (project-scoped), 4 part types (Chapter, VoiceOver, Dialogue, Shot) in separate tables, DialogueSubject, global position ordering, reorder endpoints, ManyToMany tags, OneToOne PostGroup link |
| [social-analytics-post-detail-feature.md](social-analytics-post-detail-feature.md) | Post detail endpoint | `GET /api/post-insights/detail`, single post insights with evolution, engagement rates, timeline charts comparing post vs 10-post average |
