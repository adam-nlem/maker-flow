# Backend Documentation

Index of all available documentation for the backend codebase (Symfony, PHP).

## Documentation Index

| File | Description | Scope |
|------|-------------|-------|
| [billing-feature.md](billing-feature.md) | Billing & credit system | CreditBalance (subscription + topup buckets), CreditTransaction (immutable audit log), Subscription (Stripe mirror), StripeWebhookEvent (idempotency), CreditService (pessimistic locking, debit-order rules), enums (CreditTransactionType, SourceBucket, SubscriptionPlan, SubscriptionStatus), exceptions |
| [coding-style.md](coding-style.md) | Coding standards and conventions | Project structure, naming conventions, controllers, entities (UUIDs, timestamps, serialization groups), enums, DTOs, repositories, services, helpers, API response patterns, Redis key naming, pagination, best practices |
| [integration-events-feature.md](integration-events-feature.md) | Event-driven integration lifecycle | Symfony EventDispatcher, `IntegrationCreatedEvent`, event subscribers, decoupled reactions to integration events, naming conventions |
| [integration-oauth-feature.md](integration-oauth-feature.md) | OAuth 2.0 backend flow | Instagram Authorization Code Flow, token management, Integration entity, security (CSRF state, Redis), API endpoints (create, callback, list, show, delete), external DTOs, adding new providers |
| [project-feature.md](project-feature.md) | Project management backend | Project entity, `ProjectType` enum, CRUD endpoints, 7 serialization groups, unique constraint (name + user), cascade delete behavior, pagination |
| [rabbitmq-messenger-feature.md](rabbitmq-messenger-feature.md) | Asynchronous processing | RabbitMQ broker, Symfony Messenger, Docker services, transport configuration, message/handler patterns (`#[AsMessage]`, `#[AsMessageHandler]`), retry strategy, worker management, troubleshooting |
| [social-analytics-insight-fetch-feature.md](social-analytics-insight-fetch-feature.md) | Instagram & YouTube insights fetching | Async commands via RabbitMQ, integration-level and post-level insights, Instagram Graph API, YouTube Reporting API (bulk CSV reports), InsightValueFormat enum, breakdown storage, metric mappings, deduplication logic, token refresh, error handling |
| [social-analytics-integration-detail-feature.md](social-analytics-integration-detail-feature.md) | Integration detail endpoint | `GET /api/integration-insights/detail`, aggregated insights with evolution, daily points with totalValue, streak, post count |
| [social-analytics-posts-list-feature.md](social-analytics-posts-list-feature.md) | Posts list endpoint | `GET /api/posts`, paginated posts with insights, evolution percentage calculations, time period filtering, DTOs, insight evolution helper |
| [script-feature.md](script-feature.md) | Script system for content planning | Script entity, ScriptTag (project-scoped), 8 part types (Chapter, VoiceOver, Dialogue, Shot, Text, CallToAction, RetentionCue, Hook) in separate tables, DialogueSubject, HookTemplate (reusable hook templates with placeholders), global position ordering, reorder endpoints, ManyToMany tags, OneToOne PostGroup link |
| [script-generation-feature.md](script-generation-feature.md) | AI script generation | CreatorProfile entity (per project), ScriptGeneration entity, Anthropic Claude integration, async RabbitMQ flow, prompt assembly, structured output parsing, new enums (ContentType, Tone, ScriptGoal, OpeningStyle, ScriptGenerationStatus) |
| [social-analytics-post-detail-feature.md](social-analytics-post-detail-feature.md) | Post detail endpoint | `GET /api/post-insights/detail`, single post insights with evolution, engagement rates, timeline charts comparing post vs 10-post average |
