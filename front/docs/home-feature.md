# Home Page Feature

## Overview

The home page (`/`) is a full-width analytics view. It shows aggregated overview KPIs, per-integration metric cards, views evolution charts, engagement comparison, and a ranked list of top posts. All home-page metrics come from a single REST endpoint — there is no separate dashboard endpoint anymore.

## Layout

Single-column, full-width, vertically scrollable layout (`h-full overflow-y-auto`). All sections stack vertically with `gap-5` spacing.

## Sections

1. **Time period selector** — `SelectDropdown` rendering a `Pill` trigger; controls the period applied to the entire page.
2. **HomeOverviewCards** — 4 KPI stat cards (followers, views, engagement, reach) with evolution indicators.
3. **HomeHeader** — Per-integration cards (followers, views, engagement, reach) with `IntegrationProfileInfo`.
4. **HomeViewsEvolutionChart** — Multi-line chart showing daily views per platform.
5. **HomeEngagementChart** — Horizontal bar chart comparing engagement rate across platforms.
6. **HomeTopPosts** — Platform pill selector + ranked posts list.

## Data Sources

All home page analytics come from a single hook: `useListIntegrationInsights({ projectUuid, timePeriod })`. The `IntegrationInsightsResponseDTO` it returns contains:

- `groups: IntegrationInsightsGroupedByIntegrationDTO[]` — fed to `HomeHeader` and `HomeEngagementChart` (per-integration metrics derived from each group's `insights` array; engagement rate computed client-side).
- `overview: IntegrationInsightsOverviewDTO` — fed to `HomeOverviewCards` (KPIs + evolution strings).
- `viewsTimeline: IntegrationInsightsViewsTimelineDTO[]` — fed to `HomeViewsEvolutionChart`.

`HomeTopPosts` uses a separate `useListPaginatedRankedPosts` hook.

## Empty States

- **No integrations:** `ConnectIntegrationPlaceholder`
- **Not subscribed:** `PremiumPlaceholder`
- **Loading:** Shimmer skeleton matching header + cards + chart layout

## Components

### HomeHeader

**File:** `app/components/home/HomeHeader.tsx`

Renders one card per connected integration with `IntegrationProfileInfo` and metrics (Followers, Views, Engagement, Reach). Metrics are extracted from each group's `insights` array via `getInsightValue` and `computeEngagementRate` (in `~/utils/insightHelpers.ts`).

Props: `groups: IntegrationInsightsGroupedByIntegrationDTO[]`

### HomeOverviewCards

**File:** `app/components/home/HomeOverviewCards.tsx`

Renders 4 `InsightTile` components for Total Followers, Total Views, Engagement Rate, and Total Reach. Each tile shows the value and an evolution indicator from the backend.

Props: `overview: IntegrationInsightsOverviewDTO | null`

### HomeViewsEvolutionChart

**File:** `app/components/home/HomeViewsEvolutionChart.tsx`

Wraps the `MultiLineChart` component with a section heading. Transforms `IntegrationInsightsViewsTimelineDTO[]` into chart series grouped by platform.

Props: `viewsTimeline: IntegrationInsightsViewsTimelineDTO[]`

### HomeEngagementChart

**File:** `app/components/home/HomeEngagementChart.tsx`

Wraps the `HorizontalBarChart` component. Derives engagement comparison data from integration insight groups, computing engagement rate client-side from each group's `insights` array.

Props: `groups: IntegrationInsightsGroupedByIntegrationDTO[]`

### HomeTopPosts

**File:** `app/components/home/HomeTopPosts.tsx`

Shows `IntegrationPillRow` (without "Toutes les plateformes" option) and `RankedPostsList`. Auto-selects the first integration if none is focused. Uses `useFocusIntegrationStore` for selection.

Props: `integrations: Integration[]`

### RankedPostsList

**File:** `app/components/home/RankedPostsList.tsx`

Calls `useListPaginatedRankedPosts({ integrationUuid })`, renders posts using `RankingItemTile` with infinite scroll. Displays Views, Likes, and Comments metrics.

Props: `integrationUuid`

## Chart Components

### MultiLineChart

**File:** `app/components/ui/MultiLineChart.tsx`

Generic multi-line Recharts chart with date X-axis and multiple series. Merges series into a unified data array keyed by date. Each line colored per platform via `platformToChartColor`.

Props: `series: { platform: Platform; data: { date: string; value: number }[] }[]`

### HorizontalBarChart

**File:** `app/components/ui/HorizontalBarChart.tsx`

Horizontal bar chart using Recharts `BarChart` with `layout="vertical"`. Each bar individually colored via `Cell` components.

Props: `data: { label: string; value: number; color: string }[]`

## Stores

### useHomePeriodStore

**File:** `app/stores/home/homePeriodStore.ts`

Zustand store with persist middleware (`app:home:period`). Uses `createResettableStore`.

| State | Type | Description |
|-------|------|-------------|
| `timePeriod` | `TimePeriod` | Selected home page time period (defaults to `Last7Days`). Drives the `useListIntegrationInsights` hook. |

| Action | Description |
|--------|-------------|
| `setTimePeriod(period)` | Sets the time period |

### useFocusIntegrationStore

**File:** `app/stores/integrations/focusIntegrationStore.ts`

Shared across home and insights pages. Used by `HomeTopPosts` for platform selection.

## Hooks

| Hook | File | API Endpoint | Returns |
|------|------|-------------|---------|
| `useListIntegrationInsights` | `app/hooks/api/integrationInsights/useListIntegrationInsights.ts` | `GET /api/integration-insights?projectUuid=...&timePeriod=...` | `{ integrationInsights: IntegrationInsightsResponseDTO \| null, isLoading, error }` |
| `useListPaginatedRankedPosts` | `app/hooks/api/posts/useListPaginatedRankedPosts.ts` | `GET /api/posts/rank` | `{ posts, isLoading, isLoadingMore, hasMore, error, listMore }` |

## DTOs

| File | Description |
|------|-------------|
| `app/dtos/integrationInsights/IntegrationInsightsResponseDTO.ts` | Top-level wrapper: `groups`, `overview`, `viewsTimeline` |
| `app/dtos/integrationInsights/IntegrationInsightsGroupedByIntegrationDTO.ts` | Integration + latest insights array |
| `app/dtos/integrationInsights/IntegrationInsightsOverviewDTO.ts` | 4 KPI values + evolution strings (period-based) |
| `app/dtos/integrationInsights/IntegrationInsightsViewsTimelineDTO.ts` | Platform + daily data points |
| `app/dtos/integrationInsights/IntegrationInsightsViewsTimelinePointDTO.ts` | `{ date, value }` |

## Query Keys

- `integrationInsightQueryKeys.list(projectUuid, timePeriod)` — `["integrationInsights", "list", projectUuid, timePeriod]`
- `postQueryKeys.rank(integrationUuid)` — `["posts", "rank", integrationUuid]`

## Shared Components

### IntegrationPillRow

**File:** `app/components/integrations/IntegrationPillRow.tsx`

Reusable row of `Pill` components for selecting an integration. Accepts `showAllOption` prop (default `true`) to conditionally show the "Toutes les plateformes" pill. `HomeTopPosts` passes `showAllOption={false}`.

Props: `integrations: Integration[]`, `showAllOption?: boolean`
