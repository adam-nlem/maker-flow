# Home Page Feature

## Overview

The home page (`/agency`) is a two-column view. The left column holds the analytics content (aggregated overview KPIs, per-integration metric cards, views evolution chart, engagement comparison, ranked top posts). The right column holds a persistent Scripts summary panel. All home-page analytics come from a single REST endpoint (`/api/integration-insights`); the Scripts panel uses `/api/scripts`.

## Layout

Two-column layout: `h-full flex flex-row gap-3 overflow-y-auto p-3 md:p-5`.
- **Left column** (`flex-1 min-w-0`): stacked analytics sections with `gap-5` spacing.
- **Right column** (`w-80 shrink-0`): `HomeScriptsPanel`, always visible when the user has integrations + an active subscription.

## Sections

### Left column
1. **Time period selector** — `SelectDropdown` rendering a `Pill` trigger; controls the period applied to the entire page.
2. **HomeOverviewCards** — 4 KPI stat cards (followers, views, engagement, reach) with evolution indicators.
3. **HomeHeader** — Per-integration cards (followers, views, engagement, reach) with `IntegrationProfileInfo`.
4. **HomeViewsEvolutionChart** — Multi-line chart showing daily views per platform.
5. **HomeEngagementChart** — Horizontal bar chart comparing engagement rate across platforms.
6. **HomeTopPosts** — Platform pill selector + ranked posts list.

### Right column
7. **HomeScriptsPanel** — Summary of the project's scripts grouped into 3 logical status groups, with a "+ Nouveau" shortcut to create a script and jump into the scripts editor.

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

Calls `useListPaginatedRankedPosts({ integrationUuid })`, renders posts using `RankingItemTile` with infinite scroll. Displays Views, Likes, and Comments metrics. Each tile is clickable: clicking a tile calls `selectPost(uuid)` on `useContentsStore` and opens `ContentsRightPanel.PostDetail` via `useContentsRightPanelStore`, which shows the shared `ContentPostDetailPanel` mounted on the home route.

Props: `integrationUuid`

### HomeScriptsPanel

**File:** `src/components/home/HomeScriptsPanel.tsx`

Right-column summary panel listing the project's scripts grouped into 3 logical status groups. Fetches scripts via `useListPaginatedScripts({ projectUuid, limit: 100 })` (one-page fetch — the per-project limit is already enforced by the subscription plan) and groups them client-side using `groupScriptsByStatusGroup` (from `~/utils/scriptHelpers`). Within each group, scripts are sorted by `updatedAt ?? createdAt` DESC so the list behaves like a "recent activity" feed. The subscription limit check uses `isScriptLimitReached` (from `~/utils/subscriptionHelpers`), shared with `ScriptListPanel`.

The panel contains:
- **Header** — "Scripts" title + `+ Nouveau` Pill button. Clicking the button reuses the `useCreateScript` + `useFocusScriptStore.setFocusedScriptUuid` flow from `ScriptListPanel`, then navigates to `/agency/scripts` so the user lands directly in the editor. The button is hidden when the subscription script limit is reached (same check as `ScriptListPanel`).
- **HomeScriptsPanelStatsBar** — 3 colored count labels (`4 idées`, `6 en cours`, `3 terminés`) and a segmented progress bar whose segments flex-grow proportionally to their group counts. Falls back to a flat `bg-light-gray` bar when the total is 0.
- **HomeScriptsPanelSection** (× 3) — Collapsible sections for `InProgress`, `Idea`, `Done` (in that order). `InProgress` and `Idea` default to open; `Done` defaults to collapsed. Each row is a `HomeScriptRow`. Clicking a row focuses the script via `setFocusedScriptUuid` and navigates to `/agency/scripts`.

The 3 groups are defined in `src/models/enums/ScriptStatusGroup.ts`:
- **Idées** = `ScriptStatus.Idea`
- **En cours** = `Scripting + Shooting + Editing + Scheduled`
- **Terminés** = `Published`

This grouping is intentionally local to this view; the rest of the app still uses the 6 individual `ScriptStatus` values (icons, pill colors, French translations inside each `HomeScriptRow` are still sourced from `ScriptStatus`).

Props: `projectUuid: string`

## Detail side panels

The home route mounts the same detail side panels as the contents page (`ContentPostDetailPanel` and `ContentGroupDetailPanel`), wired through the shared `useContentsStore` (`selectedPostUuid`, `selectedGroupUuid`) and `useContentsRightPanelStore` (`activePanel`). This lets ranked tiles open a full detail panel without duplicating the contents-page implementation. Panel state is persisted via the `app:contents:state` / `app:contents:right-panel` Zustand stores, so the panel state is shared across the home and contents routes.

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
| `useListPaginatedScripts` | `src/hooks/api/scripts/useListPaginatedScripts.ts` | `GET /api/scripts?projectUuid=...&page=...&limit=...` | `{ scripts, isLoading, isLoadingMore, hasMore, listMore, error }` (used by `HomeScriptsPanel`) |

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

## Reuse by the client portal

The client portal's home page (`/client`, rendered by [`ClientHomePage`](../src/routes/client/home.tsx)) is a slimmer flavour of this page built entirely from the same hooks and components — no client-specific dashboard components exist.

Reused verbatim:
- `HomeOverviewCards` — KPIs (followers / views / engagement / reach).
- `HomeViewsEvolutionChart` — daily views per platform.
- `HomeEngagementChart` — horizontal bar chart per platform.
- `IntegrationDetailCardRow` (the same per-integration cards used at the top of the agency page) — renders one card per connected integration.
- `ConnectIntegrationPlaceholder` — empty state when no integration is connected. The "Connect" CTA invokes the same `POST /api/integrations` flow, but `ProjectVoter::MANAGE_INTEGRATIONS` allows clients to run it on their own project (see `back/docs/integration-oauth-feature.md`).
- Stores: `useFocusProjectStore` (seeded by `useSyncFocusedProject` for the client's single accessible project) and `useHomePeriodStore` (the time-period selector is shared).

What's intentionally **not** in the client home:
- Right-column `HomeScriptsPanel` — the scripts UI is an agency-side concern.
- `HomeTopPosts` / `RankedPostsList` — ranking views live in the contents page; for the client portal first launch we kept the dashboard read-only and simple.
- `HomeHeader` — replaced by `IntegrationDetailCardRow` for a denser, simpler single row.
- The two-column layout — the client page is a single column.

## Shared Components

### IntegrationPillRow

**File:** `app/components/integrations/IntegrationPillRow.tsx`

Reusable row of `Pill` components for selecting an integration. Accepts `showAllOption` prop (default `true`) to conditionally show the "Toutes les plateformes" pill. `HomeTopPosts` passes `showAllOption={false}`.

Props: `integrations: Integration[]`, `showAllOption?: boolean`
