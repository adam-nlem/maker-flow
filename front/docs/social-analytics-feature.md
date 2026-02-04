# Social Analytics Module - Frontend Documentation

## Overview

The Social Analytics module provides Instagram analytics: follower trends, post insights, engagement metrics, and a posts table. It lives under `front/app/modules/socialAnalytics/`.

## Module Routing

The Social Analytics module uses a **module-level router** (`SocialAnalyticsRouter.tsx`) registered as the `pageView` and `router` in the module registry. The generic route `modules/:moduleIdentifier/*` renders the module router, which then handles internal sub-routes using React Router's `<Routes>` / `<Route>` pattern.

### Routes handled by the module router

| Path | Component | Description |
|------|-----------|-------------|
| `/modules/social_analytics` | `SocialAnalyticsPageView` | Main page with filters, integration selector, and posts table |
| `/modules/social_analytics/posts/:postUuid` | `SocialAnalyticsPostDetailPage` | Post detail with insight tiles and timeline charts |

### File structure

```
modules/socialAnalytics/
├── SocialAnalyticsRouter.tsx              # Module router (pageView entry point)
├── pages/
│   └── SocialAnalyticsPostDetailPage.tsx  # Post detail page (extracts params, renders view)
├── components/
│   └── ...
```

## Page Layout

The social analytics page uses a flex column layout that fills the viewport height so the posts table can scroll internally while keeping upper content (filters, profile, tiles) visible.

### Layout chain

```
SocialAnalyticsPageView          h-screen overflow-hidden, flex flex-col
  [filter bar]                   fixed height
  SocialAnalyticsIntegrationPageView   flex-1 min-h-0, flex flex-col
    [warning banner]             fixed height
    [profile + insight tiles]    fixed height
    ListSocialAnalyticsPostsTable  flex-1 min-h-0, flex flex-col
      <h1>                       fixed height
      [table wrapper]            flex-1 min-h-0 overflow-auto
        <table>
          <thead>                sticky top-0 bg-white z-10
          <tbody>                scrollable content
        [sentinel div]           h-1, IntersectionObserver trigger
```

### Key patterns

- **`h-screen` on the page root** establishes the viewport constraint. Combined with `overflow-hidden` to prevent the page itself from scrolling.
- **`flex-1 min-h-0`** on intermediate flex children allows them to shrink below their content size, which is required for overflow to work in nested flex layouts.
- **Sticky `<thead>`** keeps column headers visible while the table body scrolls.

## Components

| Component | File | Role |
|-----------|------|------|
| `SocialAnalyticsRouter` | `SocialAnalyticsRouter.tsx` | Module router handling internal sub-routes |
| `SocialAnalyticsPageView` | `components/SocialAnalyticsPageView.tsx` | Page root with filters and integration selector |
| `SocialAnalyticsIntegrationPageView` | `components/integrations/SocialAnalyticsIntegrationPageView.tsx` | Integration detail: profile, insight tiles, posts table |
| `ListSocialAnalyticsPostsTable` | `components/posts/ListSocialAnalyticsPostsTable.tsx` | Scrollable posts table with sticky headers and infinite scroll |
| `SocialAnalyticsPostsTableRow` | `components/posts/SocialAnalyticsPostsTableRow.tsx` | Individual post row |
| `SocialAnalyticsPostNumericCell` | `components/posts/SocialAnalyticsPostNumericCell.tsx` | Numeric metric cell with optional tooltip |
| `SocialAnalyticsPostDurationCell` | `components/posts/SocialAnalyticsPostDurationCell.tsx` | Duration metric cell (formatted in French) |
| `SocialAnalyticsPostEvolutionBadge` | `components/posts/SocialAnalyticsPostEvolutionBadge.tsx` | Evolution percentage badge (green/red) |
| `SocialAnalyticsInsightTile` | `components/SocialAnalyticsInsightTile.tsx` | Metric tile with optional area chart |
| `SocialAnalyticsPostDetailPageView` | `components/posts/SocialAnalyticsPostDetailPageView.tsx` | Post detail page with insight tiles and timeline charts |
| `SocialAnalyticsPostInsightSummaryCard` | `components/posts/SocialAnalyticsPostInsightSummaryCard.tsx` | Visibility summary grid card (Views, Reach, AvgWatchTime, TotalWatchTime) with evolution badges; formats watch time values with `formatDurationToFrench` |
| `SocialAnalyticsPostDetailPage` | `pages/SocialAnalyticsPostDetailPage.tsx` | Page wrapper that extracts `postUuid` param |
| `FilterTile` | `components/FilterTile.tsx` | Filter chip used in dropdowns |
| `LineChart` | `~/components/ui/LineChart.tsx` | Recharts line chart with current vs average lines |

## Models

- `SocialAnalyticsPost` — Post model with `uuid`, `externalId`, `mediaType`, `publishedAt`, `caption`, `externalUrl`, `duration`
- `SocialAnalyticsPostInsight` — Insight entity with `uuid`, `type`, `value`, `createdAt`, `updatedAt`

## DTOs

### Post List DTOs

- `SocialAnalyticsPostWithInsightsDTO` — Post with flat properties (`uuid`, `externalId`, `mediaType`, `publishedAt`, `caption`) + `insights` array + engagement rates
- `SocialAnalyticsPostInsightWithEvolutionDTO` — Wraps a nested `SocialAnalyticsPostInsight` (`insight.type`, `insight.value`) with `evolutionPercentage`

### Post Detail DTOs

- `SocialAnalyticsPostInsightDetailDTO` — Main detail response with nested `post` (SocialAnalyticsPost), `insightsWithEvolution`, engagement rates, and `timelines`
- `SocialAnalyticsPostInsightTimelineDTO` — Timeline per insight type
- `SocialAnalyticsPostInsightTimelinePointDTO` — Individual data point with `hoursAfterPublication`, `value`, `averageValue`

## Stores

- **`socialAnalyticsFilterStore`** — Zustand store holding `insightType`, `timePeriod`, and `focusedIntegrationUuid` filters.

## API Hooks

- `useShowSocialAnalyticsIntegrationDetail` — Fetches integration detail (followers, daily points, post count, streak).
- `useListPaginatedSocialAnalyticsPosts` — Paginated post list with `hasMore` / `listMore` for infinite scroll.
- `useShowSocialAnalyticsPostInsightDetail` — Fetches post detail with insight tiles, evolution, engagement rates, and timeline data for charts.

## Infinite Scroll

`ListSocialAnalyticsPostsTable` uses an `IntersectionObserver` on a sentinel `<div>` placed after the `<table>` inside the scrollable wrapper. When the sentinel enters the viewport (with a 200px bottom margin), the next page is fetched automatically via `listMore()`. The component reads `timePeriod` from `useSocialAnalyticsFilterStore` and applies `filterPostsByDays` locally.

## Post Detail Page

Clicking a table row navigates to `/modules/social_analytics/posts/:postUuid`. The route is handled by the module router (`SocialAnalyticsRouter`), which renders `SocialAnalyticsPostDetailPage`.

### Layout

```
┌─────────────────────────────────────────────────────┐
│ ← Retour                                            │
│                                                      │
│ [thumbnail] Caption text...                          │
│             published date (relative)                │
│                                                      │
│ [Views] [Likes] [Comments] [Shares] [Saved]         │
│ [TotalInteractions] [AvgWatchTime] [TotalWatchTime]  │
│ [Engagement/Followers] [Engagement/Reach]            │
│                                                      │
│ ┌─ Vues ───────────────────────────────────────────┐ │
│ │         [LineChart: views vs avg]                 │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ ┌─ Temps de visionnage ─ [Moyen] [Total] ──────────┐│
│ │         [LineChart: selected metric vs avg]       │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ ┌─ Engagement ─ [J'aime] [Commentaires] [Partages] ┐│
│ │         [LineChart: selected metric vs avg]       │ │
│ └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Charts

Each chart is a `LineChart` component (Recharts) showing two lines:
- **Primary line** (solid, primary color): current post's metric values over time
- **Average line** (dashed, gray): average of the 10 previous posts at the same hours-after-publication offset

X-axis uses `formatDurationToFrench()` (via a local helper converting hours to seconds) to display "2h", "1j 5h", etc.
