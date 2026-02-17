# Social Analytics Insight Fetch Feature

## Overview

This feature fetches insights from Instagram's Graph API and YouTube Analytics API using an asynchronous message queue architecture. It supports two types of insights:

- **Integration Insights**: Profile-level metrics (followers, reach, views, etc.)
- **Post Insights**: Individual post metrics (likes, comments, saves, etc.)

---

## Architecture

The system uses RabbitMQ with Symfony Messenger for asynchronous processing:

```
Console Command
    └── Dispatches messages to RabbitMQ queue
        └── Message Handler (consumed by worker)
            └── Service fetches data from Instagram/YouTube API
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
│  → YoutubePostInsightService        │
│  → InstagramPostInsightService      │
└─────────────────┬───────────────────┘
                  │ API call
                  ▼
┌─────────────────────────────────────┐
│   Instagram Graph API / YouTube     │
│   Analytics API                     │
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
| `FetchIntegrationInsightsHandler` | `SocialAnalyticsIntegrationInsightService::fetchInstagramProfileInsights()` or `fetchYoutubeProfileInsights()` |
| `FetchPostInsightsHandler` | `SocialAnalyticsPostInsightService::fetchInstagramPostInsights()` or `fetchYoutubePostInsights()` |

### Commands

| Command | Description |
|---------|-------------|
| `app:social-analytics:fetch-integration-insights` | Dispatches messages for Instagram and YouTube integrations not synced in the last 24 hours |
| `app:social-analytics:fetch-post-insights` | Dispatches messages for all Instagram and YouTube integrations to fetch post insights |

#### Sync Threshold

The `fetch-integration-insights` command only fetches insights for integrations whose `lastSyncedAt` is older than 24 hours. This prevents excessive API calls and respects rate limits.

Supported providers are defined in the command's `SUPPORTED_PROVIDERS` constant:
- `IntegrationProvider::Instagram`
- `IntegrationProvider::Youtube`

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
- `fields`: `id,media_type,timestamp,thumbnail_url,caption,permalink,insights.metric(reach,total_interactions,saved,views,likes,comments)`
- `limit`: `100`
- `access_token`: Integration's access token

---

## YouTube API Details

### Integration Insights

YouTube insights are fetched using two Google APIs:

#### 1. YouTube Data API (for subscriber count)

**Service:** `Google\Service\YouTube`
**Method:** `channels->listChannels('statistics', ['mine' => true])`

Returns channel statistics including:
- `subscriberCount` - Total subscriber count (maps to `TotalFollowers`)

#### 2. YouTube Analytics API (for daily metrics)

**Service:** `Google\Service\YouTubeAnalytics`
**Method:** `reports->query()`

**Parameters:**
- `ids`: `channel==MINE`
- `startDate`: Previous day (YYYY-MM-DD)
- `endDate`: Current day (YYYY-MM-DD)
- `metrics`: `views,likes,dislikes,comments,shares,subscribersGained`

The response contains `columnHeaders` (metric names) and `rows` (values).

### Post Insights

YouTube post insights require multiple API calls to collect video metadata and analytics. All metrics are fetched from the YouTube Analytics API.

#### API Call Strategy

1. **`channels.list(part=contentDetails, mine=true)`** — get the uploads playlist ID (1 call)
2. **`playlistItems.list(part=contentDetails, playlistId=..., maxResults=50)`** — get video IDs (paginated, 50 per page)
3. **`videos.list(id=batch, part=snippet,contentDetails)`** — get video metadata (title, duration, thumbnail) in batches of 50
4. **`reports.query(dimensions=day,video, filters=video==ids)`** — get all metrics from Analytics API in batches of 200 (Time-based report with `day,video` dimensions supports all 11 metrics with the `video` filter)

**Total for N videos**: `2 + 2*ceil(N/50) + ceil(N/200)` calls. For 100 videos: ~7 calls.

#### Analytics API Metrics (from `reports.query`)

| YouTube Metric | SocialAnalyticsPostInsightType | Notes |
|---|---|---|
| `views` | `Views` | |
| `likes` | `Likes` | |
| `dislikes` | `Dislikes` | |
| `comments` | `Comments` | |
| `shares` | `Shares` | |
| `averageViewDuration` | `AverageWatchTime` | Already in seconds |
| `estimatedMinutesWatched` | `TotalWatchTime` | Converted from minutes to seconds (x60) |
| `videoThumbnailImpressions` | `ThumbnailImpressions` | |
| `videoThumbnailImpressionsClickRate` | `ThumbnailImpressionsClickRate` | |
| `subscribersGained` | `FollowersGained` | |
| `subscribersLost` | `FollowersLost` | |

#### Video Field Mapping to SocialAnalyticsPost

| SocialAnalyticsPost field | YouTube source |
|---|---|
| `externalId` | Video ID |
| `mediaType` | `SocialAnalyticsMediaType::Video` (all YouTube content) |
| `publishedAt` | `snippet.publishedAt` |
| `duration` | `contentDetails.duration` (ISO 8601 parsed to seconds) |
| `caption` | Video title (`snippet.title`) |
| `externalUrl` | `https://www.youtube.com/watch?v={videoId}` |
| `thumbnailUrl` | `snippet.thumbnails.high.url` |

### Token Refresh

YouTube tokens expire after ~1 hour. The `YoutubeOAuthService::refreshTokenIfNeeded()` method:
1. Checks if `expiresAt` is within 20 minutes
2. If yes, uses the refresh token to get a new access token
3. Updates the integration with new token and expiry

---

## Metric Mappings

### Instagram Integration Insight Types

| Instagram API Metric | SocialAnalyticsIntegrationInsightType |
|---------------------|---------------------------------------|
| `reach` | `Reach` |
| `views` | `Views` |
| `follower_count` | `GainedFollowers` |
| `followers_count` | `TotalFollowers` |
| `profile_links_taps` | `ProfileLinksTaps` |
| `comments` | `Comments` |
| `shares` | `Shares` |
| `saves` | `Saves` |
| `likes` | `Likes` |

### YouTube Integration Insight Types

| YouTube API Metric | SocialAnalyticsIntegrationInsightType |
|-------------------|---------------------------------------|
| `views` | `Views` |
| `likes` | `Likes` |
| `dislikes` | `Dislikes` |
| `comments` | `Comments` |
| `shares` | `Shares` |
| `subscribersGained` | `GainedFollowers` (daily gained) |
| `subscriberCount` | `TotalFollowers` |

### Instagram Post Insight Types

| Instagram API Metric | SocialAnalyticsPostInsightType |
|---------------------|-------------------------------|
| `reach` | `Reach` |
| `total_interactions` | `TotalInteractions` |
| `saved` | `Saved` |
| `views` | `Views` |
| `likes` | `Likes` |
| `comments` | `Comments` |
| `shares` | `Shares` |
| `ig_reels_avg_watch_time` | `AverageWatchTime` (converted from ms to s) |
| `ig_reels_video_view_total_time` | `TotalWatchTime` (converted from ms to s) |

### YouTube Post Insight Types

| YouTube Metric | SocialAnalyticsPostInsightType | Notes |
|---|---|---|
| `views` | `Views` | Analytics API |
| `likes` | `Likes` | Analytics API |
| `dislikes` | `Dislikes` | Analytics API |
| `comments` | `Comments` | Analytics API |
| `shares` | `Shares` | Analytics API |
| `averageViewDuration` | `AverageWatchTime` | Analytics API (already in seconds) |
| `estimatedMinutesWatched` | `TotalWatchTime` | Analytics API (converted from minutes to seconds) |
| `videoThumbnailImpressions` | `ThumbnailImpressions` | Analytics API |
| `videoThumbnailImpressionsClickRate` | `ThumbnailImpressionsClickRate` | Analytics API |
| `subscribersGained` | `FollowersGained` | Analytics API |
| `subscribersLost` | `FollowersLost` | Analytics API |

---

## Platform Service Architecture

Post insight fetching is split into platform-specific services for separation of concerns:

- **`SocialAnalyticsPostInsightService`** — orchestrator that handles API authentication, pagination, and delegates to platform services. Also contains display logic (detail, timelines, ranking).
- **`YoutubePostInsightService`** — YouTube-specific logic: fetching video IDs, building post DTOs, enriching with Analytics API data, and persisting insights.
- **`InstagramPostInsightService`** — Instagram-specific logic: parsing post data and persisting insights (with ms→s watch time conversion).

Each platform service has its own `createPostInsights` and `shouldCreateInsight` methods, specialized for the platform's needs.

---

## Files

```
src/Module/SocialAnalytics/
├── Command/
│   ├── FetchIntegrationInsightsCommand.php
│   └── FetchPostInsightsCommand.php
├── DTO/
│   └── External/
│       ├── Instagram/
│       │   ├── InstagramIntegrationInsightDTO.php
│       │   ├── InstagramPostDTO.php
│       │   └── InstagramPostInsightDTO.php
│       └── Youtube/
│           ├── YoutubeIntegrationInsightDTO.php
│           ├── YoutubePostDTO.php
│           └── YoutubePostInsightDTO.php
├── Message/
│   ├── FetchIntegrationInsightsMessage.php
│   ├── FetchPostInsightsMessage.php
│   └── Handler/
│       ├── FetchIntegrationInsightsHandler.php
│       └── FetchPostInsightsHandler.php
└── Service/
    ├── SocialAnalyticsIntegrationInsightService.php
    ├── SocialAnalyticsPostInsightService.php
    ├── YoutubePostInsightService.php
    └── InstagramPostInsightService.php
```

---

## Usage

### Running Commands

```bash
# Fetch integration insights for all Instagram integrations
dce back php bin/console app:social-analytics:fetch-integration-insights

# Fetch post insights for all Instagram and YouTube integrations
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

### Instagram
The `refreshTokenIfNeeded` method in `InstagramOAuthService`:
1. Checks if `expiresAt` is within 7 days
2. If yes, calls Instagram's refresh token endpoint
3. On success: updates the integration with new token and expiry, persists changes
4. On 4xx error (`ClientExceptionInterface`): sets integration status to `Revoked`, persists, throws `OAuthTokenRevokedException`

### YouTube
The `refreshTokenIfNeeded` method in `YoutubeOAuthService`:
1. Checks if `expiresAt` is within 20 minutes (YouTube tokens expire after ~1 hour)
2. If yes, uses Google Client to fetch new access token with refresh token
3. Updates the integration with new token and expiry
4. Persists changes to database

---

## Error Handling

- **Invalid provider**: Throws `InvalidArgumentException` if integration provider doesn't match the method
- **Missing integration**: Handler silently returns if integration not found by ID
- **Revoked integration**: Handler silently returns if integration status is not `Active` (defense in depth)
- **API errors**: HTTP errors from Instagram/YouTube APIs propagate as exceptions
- **Revoked OAuth token (YouTube `invalid_grant`)**: When YouTube returns `invalid_grant` (user revoked access, refresh token expired, etc.), the integration status is set to `Revoked` and an `OAuthTokenRevokedException` is thrown. The exception is caught by message handlers, logged, and the worker continues processing other integrations.
- **Revoked OAuth token (Instagram 4xx)**: When Instagram returns a 4xx error during token refresh (user revoked access, token expired beyond renewal, etc.), the `ClientExceptionInterface` is caught, the integration status is set to `Revoked`, and an `OAuthTokenRevokedException` is thrown. Same handling as YouTube.
- **Commands skip revoked integrations**: Both `FetchPostInsightsCommand` and `FetchIntegrationInsightsCommand` use status-filtered repository queries (`getByProviderAndStatus`, `getByProvidersNotSyncedSinceAndStatus`) with `IntegrationStatus::Active`, preventing wasted API calls and repeated errors for revoked integrations.
- **Failed messages**: Stored in `failed` transport for manual retry (see RabbitMQ documentation)

---

## Notes

- Each fetch creates **new** insight entities only if values changed (for historical tracking)
- `lastSyncedAt` is updated on the integration after successful fetch
- Posts are created only if they don't already exist (checked by `externalId`)
- Thumbnail images are downloaded and stored locally when posts are created
