# Social Analytics Insight Fetch Feature

## Overview

This feature fetches insights from Instagram's Graph API and YouTube's Reporting API using an asynchronous message queue architecture. It supports two types of insights:

- **Integration Insights**: Profile-level metrics (followers, reach, views, etc.)
- **Post Insights**: Individual post metrics (likes, comments, saves, etc.)
- **Post Insight Breakdowns**: Per-country/status/live dimensional data from YouTube Reporting API

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
│       (messages transport)          │
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
│  IntegrationInsight  │
│  Service / PostInsightService       │
│  → YoutubePostInsightService        │
│  → YoutubeReportingService          │
│  → InstagramPostInsightService      │
└─────────────────┬───────────────────┘
                  │ API call
                  ▼
┌─────────────────────────────────────┐
│   Instagram Graph API / YouTube     │
│   Data API / Reporting API          │
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
| `FetchIntegrationInsightsHandler` | `IntegrationInsightService::fetchInstagramProfileInsights()` or `fetchYoutubeProfileInsights()` |
| `FetchPostInsightsHandler` | `PostInsightService::fetchInstagramPostInsights()` or `fetchYoutubePostInsights()` |

### Commands

| Command | Description |
|---------|-------------|
| `app:social-analytics:fetch-integration-insights` | Dispatches messages for Instagram and YouTube integrations not synced in the last 24 hours |
| `app:social-analytics:fetch-post-insights` | Dispatches messages for all Instagram and YouTube integrations to fetch post insights |

#### Sync Threshold

The `fetch-integration-insights` command only fetches insights for integrations whose `lastSyncedAt` is older than 24 hours. This prevents excessive API calls and respects rate limits.

Supported platforms are defined in the command's `SUPPORTED_PLATFORMS` constant:
- `Platform::Instagram`
- `Platform::Youtube`

---

## Insight Value Storage

### InsightValueFormat Enum

All insight values are stored as `DOUBLE PRECISION` (float) in the database. The `InsightValueFormat` enum conveys the semantic meaning of each value:

| Format | Description | Example Types |
|--------|-------------|---------------|
| `integer` | Count values (views, likes, etc.) | Views, Likes, Comments, Shares |
| `float` | Generic decimal values | - |
| `percentage` | Ratios stored as 0.0-1.0 (frontend multiplies by 100 for display) | ThumbnailImpressionsClickRate, AudienceWatchRatio |
| `seconds` | Duration values in seconds | AverageWatchTime, TotalWatchTime |

Each insight type enum (`PostInsightType`, `IntegrationInsightType`) has a `getValueFormat()` method that maps the type to its format. This is set automatically when creating insight entities.

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
- `fields`: `id,media_type,timestamp,thumbnail_url,caption,permalink,insights.metric(reach,saved,views,likes,comments,shares,ig_reels_avg_watch_time,ig_reels_video_view_total_time)`
- `limit`: `100`
- `access_token`: Integration's access token

---

## YouTube API Details

### Integration Insights

YouTube integration insights are fetched using two Google APIs:

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
- `startDate`: 1 month ago (YYYY-MM-DD)
- `endDate`: Current day (YYYY-MM-DD)
- `metrics`: `views,likes,dislikes,comments,shares,subscribersGained`

The response contains `columnHeaders` (metric names) and `rows` (values).

### Post Insights (3 data sources)

YouTube post insights use three complementary data sources:

1. **YouTube Data API** (`videos.list` with `part=statistics`) — Real-time lifetime totals for views, likes, comments. Zero extra API calls (fetched alongside video metadata).
2. **YouTube Analytics API** (`reports.query` with `dimensions=video`) — Lifetime totals for shares, watch time, average watch time, dislikes, subscribers gained/lost. Paginated (200 videos per call).
3. **YouTube Reporting API** — Daily CSV reports with dimensional breakdowns (by country, subscriber status, live/on-demand) and metrics only available here (thumbnail impressions, CTR).

When metrics overlap, priority is: Data API > Analytics API > Reporting API. The Reporting API is only used for metrics not already populated by the other two sources.

#### Data API Statistics

Added to the existing `videos.list` call (no extra API calls):

| Data API Field | PostInsightType | Notes |
|---|---|---|
| `viewCount` | `Views` | Real-time lifetime total |
| `likeCount` | `Likes` | Real-time lifetime total |
| `commentCount` | `Comments` | Real-time lifetime total |

#### Analytics API (Lifetime Per-Video)

**Service:** `Google\Service\YouTubeAnalytics`
**Method:** `reports->query()`

**Parameters:**
- `ids`: `channel==MINE`
- `startDate`: `2005-01-01` (earliest possible, captures all historical data)
- `endDate`: Current day (YYYY-MM-DD)
- `dimensions`: `video`
- `metrics`: `shares,estimatedMinutesWatched,averageViewDuration,dislikes,subscribersGained,subscribersLost`
- `maxResults`: `200` (paginated with `startIndex`)
- `sort`: `-estimatedMinutesWatched`

| Analytics API Metric | PostInsightType | Notes |
|---|---|---|
| `shares` | `Shares` | Lifetime total |
| `estimatedMinutesWatched` | `TotalWatchTime` | Converted from minutes to seconds (x60) |
| `averageViewDuration` | `AverageWatchTime` | Already in seconds |
| `dislikes` | `Dislikes` | Lifetime total |
| `subscribersGained` | `FollowersGained` | Lifetime total |
| `subscribersLost` | `FollowersLost` | Lifetime total |

#### Reporting API (Breakdowns + Thumbnail Metrics)

The Reporting API continues to provide bulk daily CSV reports with per-video breakdowns by country, subscriber status, and live/on-demand. It is the only source for thumbnail impression metrics.

##### Reporting API Flow

```
1. Ensure reporting jobs exist (lazy creation)
   └── Check DB → Check Google → Create if missing
2. Poll for new reports
   └── List reports → Filter by lastProcessedReportDate
3. Download CSV report
4. Parse CSV → aggregate per video + store breakdowns
5. Enrich PostDTOs with aggregated data (skip metrics already from Data/Analytics API)
6. Persist insights
```

#### Report Types

| Report Type ID | Entity Enum | Description |
|---|---|---|
| `channel_basic_a3` | `YoutubeReportType::ChannelBasic` | Core engagement metrics (views, likes, comments, shares, watch time, subscribers) with country/status/live dimensions |
| `channel_reach_basic_a1` | `YoutubeReportType::ChannelReach` | Reach metrics (thumbnail impressions, CTR) |

#### YoutubeReportingJob Entity

Tracks Reporting API jobs per integration:

| Field | Description |
|---|---|
| `externalJobId` | Google's job ID |
| `reportType` | `YoutubeReportType` enum (e.g., `ChannelBasic`) |
| `lastProcessedReportId` | ID of the last processed report (for incremental polling) |
| `lastProcessedReportDate` | Creation time of the last processed report |
| `integration` | ManyToOne → Integration |

Unique constraint on `(integration_id, report_type)`.

#### Initial Delay (24-48h)

When Reporting API jobs are first created, reports are **not immediately available**. Google begins generating reports from the job creation time, and the first report typically appears 24-48 hours later. During this period:
- Posts are created with metadata only (title, thumbnail, duration, etc.)
- No insight data is available yet
- On subsequent fetches, once reports are available, insights will be enriched

#### API Call Strategy

1. **`channels.list(part=contentDetails, mine=true)`** — get the uploads playlist ID (1 call)
2. **`playlistItems.list(part=contentDetails, playlistId=..., maxResults=50)`** — get video IDs (paginated, 50 per page)
3. **`videos.list(id=batch, part=snippet,contentDetails,statistics)`** — get video metadata + lifetime views/likes/comments in batches of 50
4. **Analytics API: `reports.query(dimensions=video, maxResults=200)`** — get lifetime shares/watch time/etc. per video (paginated, 200 per page)
5. **Reporting API: `jobs.list()` / `jobs.create()`** — ensure reporting jobs exist (1-2 calls, only on first run)
6. **Reporting API: `jobs.reports.list()`** — poll for new reports (1 call per job)
7. **Reporting API: download CSV** — download report content (1 call per report)

**Total for N videos (after initial setup)**: `1 + ceil(N/50) + ceil(N/50) + ceil(N/200) + 2 + 2` calls. For 100 videos: ~11 calls.

#### Reporting API Metrics (from CSV)

| CSV Column | PostInsightType | Notes |
|---|---|---|
| `views` | `Views` | |
| `likes` | `Likes` | |
| `dislikes` | `Dislikes` | |
| `comments` | `Comments` | |
| `shares` | `Shares` | |
| `average_view_duration_seconds` | `AverageWatchTime` | Already in seconds |
| `watch_time_minutes` | `TotalWatchTime` | Converted from minutes to seconds (x60) |
| `subscribers_gained` | `FollowersGained` | |
| `subscribers_lost` | `FollowersLost` | |
| `video_thumbnail_impressions` | `ThumbnailImpressions` | |
| `video_thumbnail_impressions_ctr` | `ThumbnailImpressionsClickRate` | Stored as ratio 0.0-1.0 |

#### PostInsightBreakdown Entity

Stores per-row dimensional data from Reporting API CSV reports. Each row in the CSV becomes multiple breakdown entities (one per metric).

| Field | Description |
|---|---|
| `type` | `PostInsightType` enum |
| `value` | Float metric value |
| `valueFormat` | `InsightValueFormat` enum |
| `date` | Report date (from CSV `date` column) |
| `countryCode` | ISO 3166-1 alpha-2 (e.g., "US", "FR"), nullable |
| `subscribedStatus` | `YoutubeSubscribedStatus` enum (SUBSCRIBED/NOT_SUBSCRIBED), nullable |
| `liveOrOnDemand` | `YoutubeLiveOrOnDemand` enum (LIVE/ON_DEMAND), nullable |
| `socialAnalyticsPost` | ManyToOne → Post |
| `user` | ManyToOne → User |

#### Video Field Mapping to Post

| Post field | YouTube source |
|---|---|
| `externalId` | Video ID |
| `mediaType` | `MediaType::Video` (all YouTube content) |
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

| Instagram API Metric | IntegrationInsightType |
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

| YouTube API Metric | IntegrationInsightType |
|-------------------|---------------------------------------|
| `views` | `Views` |
| `likes` | `Likes` |
| `dislikes` | `Dislikes` |
| `comments` | `Comments` |
| `shares` | `Shares` |
| `subscribersGained` | `GainedFollowers` (daily gained) |
| `subscriberCount` | `TotalFollowers` |

### Instagram Post Insight Types

| Instagram API Metric | PostInsightType |
|---------------------|-------------------------------|
| `reach` | `Reach` |
| `saved` | `Saved` |
| `views` | `Views` |
| `likes` | `Likes` |
| `comments` | `Comments` |
| `shares` | `Shares` |
| `ig_reels_avg_watch_time` | `AverageWatchTime` (converted from ms to s) |
| `ig_reels_video_view_total_time` | `TotalWatchTime` (converted from ms to s) |
| *(calculated)* | `TotalInteractions` = Likes + Comments + Shares + Saved |

### YouTube Post Insight Types

| Metric | PostInsightType | Source | Notes |
|---|---|---|---|
| `viewCount` | `Views` | Data API | Real-time lifetime total |
| `likeCount` | `Likes` | Data API | Real-time lifetime total |
| `commentCount` | `Comments` | Data API | Real-time lifetime total |
| `shares` | `Shares` | Analytics API | Lifetime total |
| `estimatedMinutesWatched` | `TotalWatchTime` | Analytics API | Converted minutes → seconds |
| `averageViewDuration` | `AverageWatchTime` | Analytics API | Already in seconds |
| `dislikes` | `Dislikes` | Analytics API | Lifetime total |
| `subscribersGained` | `FollowersGained` | Analytics API | Lifetime total |
| `subscribersLost` | `FollowersLost` | Analytics API | Lifetime total |
| `video_thumbnail_impressions` | `ThumbnailImpressions` | Reporting API | Only source for this metric |
| `video_thumbnail_impressions_ctr` | `ThumbnailImpressionsClickRate` | Reporting API | Stored as 0.0-1.0 ratio |
| *(calculated)* | `TotalInteractions` | Computed | = Likes + Dislikes + Comments + Shares |

---

## Platform Service Architecture

Post insight fetching is split into platform-specific services for separation of concerns:

- **`PostInsightService`** — orchestrator that handles API authentication, pagination, and delegates to platform services. Also contains display logic (detail, timelines, ranking).
- **`YoutubePostInsightService`** — YouTube-specific logic: fetching video IDs, building post DTOs, enriching from Reporting API data, and persisting insights.
- **`YoutubeReportingService`** — YouTube Reporting API logic: job management, report polling, CSV download/parsing, breakdown storage, and data aggregation.
- **`InstagramPostInsightService`** — Instagram-specific logic: parsing post data and persisting insights (with ms→s watch time conversion).

Each platform service has its own `createPostInsights` and `shouldCreateInsight` methods, specialized for the platform's needs.

### Calculated Total Interactions

`TotalInteractions` is not fetched from any external API. Instead, it is computed and stored by each platform service after persisting individual metrics:

- **Instagram**: `TotalInteractions = Likes + Comments + Shares + Saved`
- **YouTube**: `TotalInteractions = Likes + Dislikes + Comments + Shares`

The calculated value is stored as a regular `PostInsight` entity with the same deduplication logic.

---

## Files

```
src/
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
├── Entity/
│   ├── Enum/
│   │   ├── InsightValueFormat.php
│   │   ├── YoutubeLiveOrOnDemand.php
│   │   ├── YoutubeReportType.php
│   │   └── YoutubeSubscribedStatus.php
│   ├── PostInsightBreakdown.php
│   └── YoutubeReportingJob.php
├── Repository/
│   ├── PostInsightBreakdownRepository.php
│   └── YoutubeReportingJobRepository.php
├── Message/
│   ├── FetchIntegrationInsightsMessage.php
│   ├── FetchPostInsightsMessage.php
│   └── Handler/
│       ├── FetchIntegrationInsightsHandler.php
│       └── FetchPostInsightsHandler.php
└── Service/
    ├── IntegrationInsight/
    │   └── IntegrationInsightService.php
    ├── PostInsight/
    │   └── PostInsightService.php
    ├── YoutubePostInsight/
    │   └── YoutubePostInsightService.php
    ├── YoutubeReporting/
    │   └── YoutubeReportingService.php
    └── InstagramPostInsight/
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
dce back php bin/console messenger:consume messages -vv
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

- **Invalid platform**: Throws `InvalidArgumentException` if integration platform doesn't match the method
- **Missing integration**: Handler silently returns if integration not found by ID
- **Revoked integration**: Handler silently returns if integration status is not `Active` (defense in depth)
- **API errors**: HTTP errors from Instagram/YouTube APIs propagate as exceptions
- **Revoked OAuth token (YouTube `invalid_grant`)**: When YouTube returns `invalid_grant` (user revoked access, refresh token expired, etc.), the integration status is set to `Revoked` and an `OAuthTokenRevokedException` is thrown. The exception is caught by message handlers, logged, and the worker continues processing other integrations.
- **Revoked OAuth token (Instagram 4xx)**: When Instagram returns a 4xx error during token refresh (user revoked access, token expired beyond renewal, etc.), the `ClientExceptionInterface` is caught, the integration status is set to `Revoked`, and an `OAuthTokenRevokedException` is thrown. Same handling as YouTube.
- **Commands skip revoked integrations**: Both `FetchPostInsightsCommand` and `FetchIntegrationInsightsCommand` use status-filtered repository queries (`getByPlatformAndStatus`, `getByPlatformsNotSyncedSinceAndStatus`) with `IntegrationStatus::Active`, preventing wasted API calls and repeated errors for revoked integrations.
- **No reports available**: During the initial 24-48h after job creation, the system gracefully handles the absence of reports — posts are created with metadata only, insights are enriched on subsequent fetches.
- **Failed messages**: Stored in `failed` transport for manual retry (see RabbitMQ documentation)

---

## Notes

- Each fetch creates **new** insight entities only if values changed (for historical tracking)
- All insight values are stored as `DOUBLE PRECISION` (float) with a `valueFormat` enum for semantic meaning
- `lastSyncedAt` is updated on the integration after successful fetch
- Posts are created only if they don't already exist (checked by `externalId`)
- Thumbnail images are downloaded and stored locally when posts are created
- YouTube Reporting API jobs are lazily created on first fetch — if Google already has a matching job, it's reused
- Breakdown data (per-country, per-subscriber-status) is stored in `PostInsightBreakdown` for future geo/audience analytics
