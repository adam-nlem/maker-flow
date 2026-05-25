# Home Page Feature

## Overview

The home page (`/agency`) is a two-column view. The left column holds the analytics content (aggregated overview KPIs, per-integration metric cards, views evolution chart, engagement comparison, ranked top posts). The right column stacks two summary panels: `HomeScriptsPanel` on top, `HomePendingReviewCommentsPanel` below — both share the column height via `flex-1 min-h-0`. All home-page analytics come from a single REST endpoint (`/api/integration-insights`); the Scripts panel uses `/api/scripts`; the pending-review-comments panel uses the dedicated `/api/review-comments/pending` endpoint.

## Layout

Two-column layout: `h-full flex flex-row gap-3 overflow-y-auto p-3 md:p-5`.
- **Left column** (`flex-1 min-w-0`): stacked analytics sections with `gap-5` spacing.
- **Right column** (`w-full md:w-1/2 shrink-0 flex flex-col gap-3 min-h-0`): `HomeScriptsPanel` + `HomePendingReviewCommentsPanel` stacked, both visible when the user has integrations + an active subscription. Each panel uses `flex-1 min-h-0` so they share the column height and scroll internally.

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
8. **HomePendingReviewCommentsPanel** — Overview of unresolved top-level comments on the latest version of each review in the focused project, grouped per review. Each comment row navigates to the review detail in `/agency/reviews`.

## Data Sources

All home page analytics come from a single hook: `useListIntegrationInsights({ projectUuid, timePeriod })`. The `IntegrationInsightsResponseDTO` it returns contains:

- `groups: IntegrationInsightsGroupedByIntegrationDTO[]` — fed to `HomeHeader` and `HomeEngagementChart` (per-integration metrics derived from each group's `insights` array; engagement rate computed client-side).
- `overview: IntegrationInsightsOverviewDTO` — fed to `HomeOverviewCards` (KPIs + evolution strings).
- `viewsTimeline: IntegrationInsightsViewsTimelineDTO[]` — fed to `HomeViewsEvolutionChart`.

`HomeTopPosts` uses a separate `useListPaginatedRankedPosts` hook.

## Empty States

- **No integrations:** the analytics surfaces self-render their disconnected state — `IntegrationDetailCardRow` always renders one card per `Platform` (`platformOptions`), with disconnected platforms showing a `Connect <platform>` button that kicks off the OAuth flow directly via `useCreateIntegration`. `HomeViewsEvolutionChart` and `HomeEngagementChart` simply hide themselves when no connected platform has data.
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

### IntegrationDetailCardRow

**File:** `src/components/integrations/IntegrationDetailCardRow.tsx`

Renders one `IntegrationDetailCard` per `Platform` in `platformOptions`, in fixed enum order. For each platform it finds the matching `IntegrationInsightsGroupedByIntegrationDTO` in `groups` and forwards it; if no integration is connected for that platform, the card renders its self-contained disconnected state (platform icon + "Not connected" label + `Connect <platform>` primary button). The button opens `useIntegrationLoginModalStore` pre-targeted to that platform; it is disabled when `projectUuid` is `null`.

Props: `groups: IntegrationInsightsGroupedByIntegrationDTO[]`, `projectUuid: string | null`

### IntegrationDetailCard

**File:** `src/components/integrations/IntegrationDetailCard.tsx`

Self-contained card for a single platform. Always renders the card frame (border + platform color bar) and delegates the header to `IntegrationProfileInfo` (which self-handles its disconnected state). Metric rows (Followers, Views, Engagement, Reach) show formatted values when `group` is provided and `"—"` otherwise. The `Connect <platform>` button is rendered only when `group` is `null`; it kicks off the OAuth flow directly via `useCreateIntegration` (no intermediate modal) and is disabled / loading while the popup is in flight or when `projectUuid` is `null`.

Props: `platform: Platform`, `group: IntegrationInsightsGroupedByIntegrationDTO | null`, `projectUuid: string | null`

### IntegrationProfileInfo

**File:** `src/components/integrations/IntegrationProfileInfo.tsx`

Self-contained profile header for a single integration. When `integration` is provided, shows the profile picture (or fallback `UserIcon`), name, username, platform icon, and — if the integration is not `Active` — a status pill alongside a login pill. When `integration` is `null`, falls back to a placeholder header: `UserIcon` avatar + platform display name + `"Not connected"` subtitle + the platform icon. The `platform` prop is the source of truth for the platform-side rendering when `integration` is `null` (and used as a fallback when present).

Props: `integration: Integration | null`, `platform: Platform`

### HomeViewsEvolutionChart

**File:** `src/components/home/HomeViewsEvolutionChart.tsx`

Wraps the `MultiLineChart` component with a section heading. Transforms `IntegrationInsightsViewsTimelineDTO[]` into chart series grouped by platform. Always renders the section frame; when there is no series to draw, shows a centered `home:viewsEvolution.empty` message in place of the chart.

Props: `viewsTimeline: IntegrationInsightsViewsTimelineDTO[]`

### HomeEngagementChart

**File:** `src/components/home/HomeEngagementChart.tsx`

Wraps the `HorizontalBarChart` component. Derives engagement comparison data from integration insight groups, computing engagement rate client-side from each group's `insights` array. Always renders the section frame; when no group yields a value, shows a centered `home:engagementByPlatformEmpty` message in place of the chart.

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

### HomePendingReviewCommentsPanel

**File:** `src/components/agency/home/HomePendingReviewCommentsPanel.tsx`

Right-column panel listing reviews in the focused project that have unresolved top-level comments on their latest version. Backed by a dedicated, single-round-trip endpoint:

- `useListPendingReviewComments({ projectUuid, limit: 100 })` calls `GET /api/review-comments/pending` and returns `ReviewCommentsGroupedByReviewDTO[]` — each item already carries its parent review (with `unresolvedCommentsCount`) and the actual open top-level comments for the latest version, server-side filtered and ordered (`createdAt ASC` so the oldest unresolved feedback surfaces first). No per-review fanout from the client.

Header shows a total `Tag` with the project's combined open count. Empty state covers "no review has open top-level comments". The body is a vertical stack of review groups, each with a clickable title row (review title + per-review count chevron) and a list of compact `HomePendingReviewCommentRow` entries (author avatar, name, relative timestamp, optional video-timecode `Tag`, two-line body).

Clicking a review title or any comment row calls `useReviewsStore.selectReview(review.uuid)` and `navigate(agencyReviewsPath)` so the agency lands directly on the review's detail panel. Resolving / reopening / creating a comment, and uploading a new version, invalidate `reviewsQueryKeys.pendingComments(projectUuid)` (added to `useUpdateReviewComment`, `useCreateReviewComment`, `useCreateReviewVersion`) so the widget refreshes automatically.

Props: `projectUuid: string`

Sub-components (same folder):
- `HomePendingReviewGroup.tsx` — one review group: header + comment list, receives its data from the parent.
- `HomePendingReviewCommentRow.tsx` — compact single-comment row (smaller variant of `ReviewCommentItem` without reply/resolve controls).

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
