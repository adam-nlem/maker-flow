# Social Analytics Insight Fetch Feature

## Overview

This feature fetches insights from Instagram's Graph API using an asynchronous message queue architecture. It supports two types of insights:

- **Integration Insights**: Profile-level metrics (followers, reach, views, etc.)
- **Post Insights**: Individual post metrics (likes, comments, saves, etc.)

---

## Architecture

The system uses RabbitMQ with Symfony Messenger for asynchronous processing:

```
Console Command
    └── Dispatches messages to RabbitMQ queue
        └── Message Handler (consumed by worker)
            └── Service fetches data from Instagram API
                └── Stores insights in database
```

### Flow Diagram

```
┌─────────────────────────────────────┐
│  FetchIntegrationInsightsCommand    │
│  FetchPostInsightsCommand           │
└─────────────────┬───────────────────┘
                  │ dispatch()
                  ▼
┌─────────────────────────────────────┐
│           RabbitMQ Queue            │
│         (async transport)           │
└─────────────────┬───────────────────┘
                  │ consume
                  ▼
┌─────────────────────────────────────┐
│  FetchIntegrationInsightsHandler    │
│  FetchPostInsightsHandler           │
└─────────────────┬───────────────────┘
                  │ invoke service
                  ▼
┌─────────────────────────────────────┐
│  SocialAnalyticsIntegrationInsight  │
│  Service / PostInsightService       │
└─────────────────┬───────────────────┘
                  │ API call
                  ▼
┌─────────────────────────────────────┐
│        Instagram Graph API          │
└─────────────────────────────────────┘
```

---

## Components

### Messages

| Message | Description |
|---------|-------------|
| `FetchIntegrationInsightsMessage` | Contains `integrationId` to fetch profile insights |
| `FetchPostInsightsMessage` | Contains `integrationId` to fetch post insights |

### Handlers

| Handler | Service Called |
|---------|----------------|
| `FetchIntegrationInsightsHandler` | `SocialAnalyticsIntegrationInsightService::fetchInstagramProfileInsights()` |
| `FetchPostInsightsHandler` | `SocialAnalyticsPostInsightService::fetchInstagramPostInsights()` |

### Commands

| Command | Description |
|---------|-------------|
| `app:social-analytics:fetch-integration-insights` | Dispatches messages for all Instagram integrations to fetch profile insights |
| `app:social-analytics:fetch-post-insights` | Dispatches messages for all Instagram integrations to fetch post insights |

---

## Instagram API Details

### Integration Insights

**Endpoint:** `GET https://graph.instagram.com/{user_id}`

**Query Parameters:**
- `fields`: `followers_count,profile_picture_url,insights.metric(reach,views,comments,shares,saves,likes).period(day).metric_type(total_value)`
- `access_token`: Integration's access token

This single request fetches:
- User fields: `followers_count`, `profile_picture_url`
- Nested insights with `total_value` metric type

The `profile_picture_url` is refreshed on each sync to prevent expiration issues (Instagram CDN URLs expire after some time).

### Post Insights

**Endpoint:** `GET https://graph.instagram.com/{user_id}/media`

**Query Parameters:**
- `fields`: `id,media_type,timestamp,thumbnail_url,caption,insights.metric(reach,total_interactions,saved,views,likes,comments)`
- `limit`: `100`
- `access_token`: Integration's access token

---

## Metric Mappings

### Integration Insight Types

| Instagram API Metric | SocialAnalyticsIntegrationInsightType |
|---------------------|---------------------------------------|
| `reach` | `Reach` |
| `views` | `Views` |
| `follower_count` | `Followers` |
| `profile_links_taps` | `ProfileLinksTaps` |
| `comments` | `Comments` |
| `shares` | `Shares` |
| `saves` | `Saves` |
| `likes` | `Likes` |

### Post Insight Types

| Instagram API Metric | SocialAnalyticsPostInsightType |
|---------------------|-------------------------------|
| `reach` | `Reach` |
| `total_interactions` | `TotalInteractions` |
| `saved` | `Saved` |
| `views` | `Views` |
| `likes` | `Likes` |
| `comments` | `Comments` |

---

## Files

```
src/Module/SocialAnalytics/
├── Command/
│   ├── FetchIntegrationInsightsCommand.php
│   └── FetchPostInsightsCommand.php
├── DTO/
│   └── External/
│       └── Instagram/
│           ├── InstagramIntegrationInsightDTO.php
│           ├── InstagramPostDTO.php
│           └── InstagramPostInsightDTO.php
├── Message/
│   ├── FetchIntegrationInsightsMessage.php
│   ├── FetchPostInsightsMessage.php
│   └── Handler/
│       ├── FetchIntegrationInsightsHandler.php
│       └── FetchPostInsightsHandler.php
└── Service/
    ├── SocialAnalyticsIntegrationInsightService.php
    └── SocialAnalyticsPostInsightService.php
```

---

## Usage

### Running Commands

```bash
# Fetch integration insights for all Instagram integrations
dce back php bin/console app:social-analytics:fetch-integration-insights

# Fetch post insights for all Instagram integrations
dce back php bin/console app:social-analytics:fetch-post-insights
```

### Starting the Worker

Messages are processed asynchronously. Start the worker to consume messages:

```bash
dce back php bin/console messenger:consume async -vv
```

---

## Deduplication Logic

Insights are only stored if the value has changed since the last record:

- **Integration Insights**: Checked via `getLatestByIntegrationAndByTypeAndByValue()`
- **Post Insights**: Checked via `getLatestByPostAndByTypeAndByValue()`

This prevents duplicate entries when values haven't changed between fetches.

---

## Token Refresh Logic

The `refreshTokenIfNeeded` method in `InstagramOAuthService`:
1. Checks if `expiresAt` is within 7 days
2. If yes, calls Instagram's refresh token endpoint
3. Updates the integration with new token and expiry
4. Persists changes to database

---

## Error Handling

- **Invalid provider**: Throws `InvalidArgumentException` if integration is not Instagram
- **Missing integration**: Handler silently returns if integration not found by ID
- **API errors**: HTTP errors from Instagram API propagate as exceptions
- **Failed messages**: Stored in `failed` transport for manual retry (see RabbitMQ documentation)

---

## Notes

- Each fetch creates **new** insight entities only if values changed (for historical tracking)
- `lastSyncedAt` is updated on the integration after successful fetch
- Posts are created only if they don't already exist (checked by `externalId`)
- Thumbnail images are downloaded and stored locally when posts are created
