# Insights Feature - Frontend Documentation

## Overview

The Insights feature provides social media analytics: follower trends, post insights, engagement metrics, and a posts table. It is a built-in feature always available per project.

## Routing

The Insights feature uses top-level routes under the protected layout.

### Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/insights` | `InsightsPageView` | Main page with filters, integration selector, and posts table |
| `/insights/posts/:postUuid` | `PostDetailPage` | Post detail with insight tiles and timeline charts |

### File structure

```
front/app/
├── components/
│   └── insights/
│       ├── InsightsPageView.tsx
│       ├── IntegrationPageView.tsx
│       ├── InsightTile.tsx
│       ├── DashboardContent.tsx
│       ├── FilterTile.tsx
│       ├── integrations/
│       │   ├── IntegrationCard.tsx
│       │   └── CreateIntegrationCard.tsx
│       └── posts/
│           ├── ListPostsTable.tsx
│           ├── PostDescriptionCell.tsx
│           ├── PostNumericCell.tsx
│           ├── PostDurationCell.tsx
│           ├── PostEvolutionBadge.tsx
│           ├── PostDetailPageView.tsx
│           └── PostInsightSummaryCard.tsx
├── hooks/
│   └── api/
│       ├── integrations/
│       └── posts/
├── models/
│   ├── Post.ts
│   ├── PostInsight.ts
│   └── dtos/
├── stores/
│   └── insights/
└── routes/
    ├── insights.tsx
    └── insights.postDetail.tsx
```

## Page Layout

The insights page uses a flex column layout that fills the viewport height so the posts table can scroll internally while keeping upper content (filters, profile, tiles) visible.

### Layout chain

```
InsightsPageView                 h-screen overflow-hidden, flex flex-col
  [filter bar]                   fixed height
  IntegrationPageView            flex-1 min-h-0, flex flex-col
    [warning banner]             fixed height
    [profile + insight tiles]    fixed height
    ListPostsTable               flex-1 min-h-0, flex flex-col
      <h1>                       fixed height
      DataTable                  flex-1 min-h-0 (generic reusable table)
        <table>
          <thead>                sticky top-0 bg-white z-10
          <tbody>                scrollable content
        [sentinel div]           h-1, afterTable slot, IntersectionObserver trigger
```

### Key patterns

- **`h-screen` on the page root** establishes the viewport constraint. Combined with `overflow-hidden` to prevent the page itself from scrolling.
- **`flex-1 min-h-0`** on intermediate flex children allows them to shrink below their content size, which is required for overflow to work in nested flex layouts.
- **Sticky `<thead>`** keeps column headers visible while the table body scrolls.

## Components

| Component | File | Role |
|-----------|------|------|
| `InsightsPageView` | `components/insights/InsightsPageView.tsx` | Page root with filters and integration selector |
| `IntegrationPageView` | `components/insights/integrations/IntegrationPageView.tsx` | Integration detail: profile, insight tiles, posts table |
| `ListPostsTable` | `components/insights/posts/ListPostsTable.tsx` | Posts table using `DataTable` with column definitions and infinite scroll |
| `PostDescriptionCell` | `components/insights/posts/PostDescriptionCell.tsx` | Thumbnail + caption + relative date cell (uses `useShowPostThumbnail` hook) |
| `PostNumericCell` | `components/insights/posts/PostNumericCell.tsx` | Numeric metric content with optional tooltip (no `<td>` wrapper) |
| `PostDurationCell` | `components/insights/posts/PostDurationCell.tsx` | Duration metric content formatted in French (no `<td>` wrapper) |
| `PostEvolutionBadge` | `components/insights/posts/PostEvolutionBadge.tsx` | Evolution percentage badge (green/red) |
| `InsightTile` | `components/insights/InsightTile.tsx` | Metric tile with optional area chart |
| `PostDetailPageView` | `components/insights/posts/PostDetailPageView.tsx` | Post detail page with insight tiles and timeline charts |
| `PostInsightSummaryCard` | `components/insights/posts/PostInsightSummaryCard.tsx` | Visibility summary grid card (Views, Reach, AvgWatchTime, TotalWatchTime) with evolution badges; formats watch time values with `formatDurationToFrench` |
| `InsightsDashboardContent` | `components/insights/InsightsDashboardContent.tsx` | Dashboard card grid: calls `useListIntegrationInsights` with `projectUuid` to get all insights grouped by integration, routes Active integrations to `IntegrationCard` (passing insights via props), Revoked/missing to `CreateIntegrationCard` |
| `IntegrationCard` | `components/insights/integrations/IntegrationCard.tsx` | Active integration card: receives `integration` and `insights` as props, displays profile picture, name, platform icon, insight value for selected type |
| `CreateIntegrationCard` | `components/insights/integrations/CreateIntegrationCard.tsx` | Placeholder card with shimmer + "Se connecter" button. Used for both new connections and re-auth of revoked integrations |
| `FilterTile` | `components/insights/FilterTile.tsx` | Filter chip used in dropdowns |
| `LineChart` | `~/components/ui/LineChart.tsx` | Recharts line chart with current vs average lines |

## Models

- `Post` -- Post model with `uuid`, `externalId`, `mediaType`, `publishedAt`, `caption`, `externalUrl`, `duration`
- `PostInsight` -- Insight entity with `uuid`, `type`, `value`, `createdAt`, `updatedAt`

## DTOs

### Post List DTOs

- `PostWithInsightsDTO` -- Wraps a nested `Post` (under `post` key) + `insights` array + engagement rates (`engagementByFollowers`, `engagementByReach`)
- `PostInsightWithEvolutionDTO` -- Wraps a nested `PostInsight` (`insight.type`, `insight.value`) with `evolutionPercentage`

### Post Detail DTOs

- `PostInsightDetailDTO` -- Main detail response with nested `post` (Post), `insightsWithEvolution`, engagement rates, `timelines`, and `ranking`
- `PostInsightTimelineDTO` -- Timeline per insight type
- `PostInsightTimelinePointDTO` -- Individual data point with `hoursAfterPublication`, `value`, `averageValue`
- `PostRankingItemDTO` -- Ranking entry wrapping a `Post` and a combined `score`

## Stores

- **`insightsFilterStore`** -- Zustand store holding `insightType`, `timePeriod`, and `focusedIntegrationUuid` filters.

## DTOs (Integration Insights)

- `IntegrationInsightsGroupedByIntegrationDTO` -- Groups an `Integration` with its `IntegrationInsight[]`. Returned as array from `GET /api/integration-insights?projectUuid=...`.

## API Hooks

- `useListIntegrationInsights` -- Fetches all integration insights grouped by integration for a project (`projectUuid`). Returns `insightsOverview: IntegrationInsightsOverviewDTO | null`.
- `useShowIntegrationDetail` -- Fetches integration detail (followers, daily points, post count, streak).
- `useListPaginatedPosts` -- Paginated post list with `hasMore` / `listMore` for infinite scroll.
- `useShowPostInsightDetail` -- Fetches post detail with insight tiles, evolution, engagement rates, timeline data for charts, and ranking data.

## Infinite Scroll

`ListPostsTable` uses an `IntersectionObserver` on a sentinel `<div>` passed via DataTable's `afterTable` prop. The sentinel is placed after the `<table>` inside the scrollable wrapper. When it enters the viewport (with a 200px bottom margin), the next page is fetched automatically via `listMore()`. The component reads `timePeriod` from `useInsightsFilterStore` and applies `filterPostsByDays` locally.

## Post Detail Page

Clicking a table row navigates to `/insights/posts/:postUuid`. The route renders the `PostDetailPage` component.

### Layout

```
+-----------------------------------------------------+
| <- Retour                                            |
|                                                      |
| [thumbnail] Caption text...                          |
|             published date (relative)                |
|                                                      |
| [Views] [Likes] [Comments] [Shares] [Saved]         |
| [TotalInteractions] [AvgWatchTime] [TotalWatchTime]  |
| [Engagement/Followers] [Engagement/Reach]            |
|                                                      |
| +- Vues -------------------------------------------+ |
| |         [LineChart: views vs avg]                 | |
| +---------------------------------------------------+|
|                                                      |
| +- Temps de visionnage - [Moyen] [Total] -----------+|
| |         [LineChart: selected metric vs avg]       | |
| +---------------------------------------------------+|
|                                                      |
| +- Engagement - [J'aime] [Commentaires] [Partages] -+|
| |         [LineChart: selected metric vs avg]       | |
| +---------------------------------------------------+|
+------------------------------------------------------+
```

### Charts

Each chart is a `LineChart` component (Recharts) showing two lines:
- **Primary line** (solid, primary color): current post's metric values over time
- **Average line** (dashed, gray): average of the 10 previous posts at the same hours-after-publication offset

X-axis uses `formatDurationToFrench()` (via a local helper converting hours to seconds) to display "2h", "1j 5h", etc.

## Thumbnail Hook

`useShowPostThumbnail` fetches post thumbnails as blobs and creates object URLs for display. The hook stores the raw `Blob` in React Query's cache (not the object URL), then creates the object URL via `useMemo` and revokes it on cleanup via `useEffect`. This prevents memory leaks from unreleased object URLs accumulating over time.

## Platform-Specific Banners

`IntegrationPageView` displays conditional info banners depending on the integration platform:

- **Instagram** (amber): Explains that Instagram does not provide historical data, so analytics are built incrementally over time. Only shown when `integration.platform === Platform.Instagram`.
- **YouTube** (blue): Shown when `detail.isYoutubeReportPending === true`. Explains that YouTube reporting jobs take 24-48 hours to generate after initial connection. Displays a spinning `ArrowPathIcon` animation to indicate the process is ongoing. The banner disappears once all reporting jobs have processed at least one report.

## Cleanup Notes

- **Design system colors**: Evolution badges and insight tiles use `text-green` / `bg-pastel-green` (positive) and `text-danger` / `bg-danger/10` (negative) from the design system instead of hardcoded Tailwind color classes.
- **Dashboard integration routing**: `InsightsDashboardContent` fetches all insights grouped by integration via `useListIntegrationInsights({ projectUuid })`, iterates `platformOptions`, and renders `IntegrationCard` (passing `insights` via props) for Active integrations or `CreateIntegrationCard` for Revoked/missing integrations. This means revoked integrations show the same shimmer + "Se connecter" card as platforms with no integration at all, reusing the existing OAuth flow for re-authentication.
- **Post detail safe rendering**: The timeline chart renders conditionally when the selected timeline exists. Engagement progress bars use `?? 0` fallback for nullable values. The empty placeholder div was removed and the chart section takes full width.
