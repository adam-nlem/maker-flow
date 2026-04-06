# Script Feature — Frontend Documentation

## Overview

The Script feature provides a split-view editor for managing scripts per project. Users create scripts, edit their metadata (title, publication date, tags, platforms, status), and build structured content with eight part types: hooks, chapters, voice-overs, dialogues, shots, texts, call-to-actions, and retention cues. Parts are reorderable via drag-and-drop. Text parts provide a notebook-style editing experience with auto-save on blur.

**Route:** `/scripts`

---

## Architecture

### Split-View Layout

**Desktop** (`hidden md:flex flex-row`):

```
ScriptPageView (flex-row h-screen)
  ├── ScriptListPanel (w-72, left panel)
  │     ├── ScriptListItem[] (per script, uses ScriptSimpleMetaCol)
  │     └── "+ New script" button (inline creation)
  ├── ScriptEditorPanel (flex-1, center panel)
  │     ├── ScriptMetaHeader (collapsible via ChevronUp/Down toggle)
  │     │     ├── [title input] + [toggle button] (always visible)
  │     │     ├── Expanded: ScriptPlatformsRow, ScriptTagsRow, status, date picker
  │     │     └── Collapsed: ScriptSimpleMetaCol (compact read-only summary)
  │     └── ScriptPartsList (flex-1 overflow-y-auto)
  │           ├── ScriptHookCard (hook part, InboxStackIcon → HookTemplatePanel toggle)
  │           ├── DnD-reorderable part cards
  │           └── AddScriptPartMenu (sticky bottom)
  ├── GenerateScriptPanel (w-96, right, optional — via ScriptRightPanel.Generate)
  └── HookTemplatePanel (w-72, right, optional — via ScriptRightPanel.HookTemplates)
        ├── Search input + category filter (ToggleChip)
        ├── HookTemplateCard[] (infinite scroll)
        └── CreateHookTemplateModal (via + button)
```

**Mobile** (`md:hidden flex flex-col`):

Each panel becomes a separate full-screen view. The active view is derived from `focusScriptStore.focusedScriptUuid`:
- `null` → **list view**: ScriptListPanel renders full-width (inline layout, no SidePanel wrapper)
- non-null → **editor view**: ScriptEditorPanel renders full-width with a back arrow button (ArrowLeftIcon in ScriptMetaHeader, `md:hidden`)

Right panels (GenerateScriptPanel, HookTemplatePanel) render as **fixed full-screen overlays** on mobile via SidePanel's responsive collapsible behavior (`fixed top-12 left-0 right-0 bottom-0 z-40`). They self-manage visibility through `useScriptRightPanelStore`.

### File Structure

```
front/app/
├── models/
│   ├── Script.ts
│   ├── ScriptTag.ts
│   ├── dtos/
│   │   └── ListScriptsGroupedByDayDTO.ts  ← calendar API response DTO
│   ├── ScriptPart.ts            ← union type + scriptPartFromJSON factory
│   ├── ScriptChapter.ts         ← type = 'chapter' as const
│   ├── ScriptVoiceOver.ts       ← type = 'voice_over' as const
│   ├── ScriptDialogue.ts        ← type = 'dialogue' as const
│   ├── ScriptShot.ts            ← type = 'shot' as const
│   ├── ScriptText.ts            ← type = 'text' as const
│   ├── ScriptCallToAction.ts    ← type = 'call_to_action' as const
│   ├── ScriptRetentionCue.ts    ← type = 'retention_cue' as const
│   ├── ScriptHook.ts            ← type = 'hook' as const, optional hookTemplate
│   ├── HookTemplate.ts          ← uuid, title, content, isPublic, createdAt, updatedAt
│   ├── DialogueSubject.ts
│   └── enums/
│       ├── ScriptPartType.ts    ← with french translation + icon + bg/border/text class maps
│       ├── ScriptStatus.ts      ← with label/bg/text class maps (pending, in_progress, completed)
│       ├── ChapterType.ts       ← with label/bg/text class maps
│       ├── Tone.ts              ← with label/bg/text class maps (renamed from VoiceOverType)
│       ├── ShotType.ts          ← with label/bg/text class maps
│       ├── CallToActionType.ts  ← with label/bg/text class maps
│       ├── RetentionCueType.ts  ← with label/bg/text class maps
│       ├── HookTemplatePlaceholder.ts ← 11 values (toFrenchTranslation map)
│       └── HookTemplateCategory.ts    ← All, Public, Private (toFrenchTranslation map)
├── hooks/api/
│   ├── scripts/
│   │   ├── scriptQueryKeys.ts   ← all, list(projectUuid, status?), calendar(projectUuid, year, month), parts(scriptUuid)
│   │   ├── useListPaginatedScripts.ts  ← infinite scroll (page/limit/hasMore)
│   │   ├── useListCalendarScripts.ts   ← monthly scripts grouped by day
│   │   ├── useCreateScript.ts   ← returns Script (for immediate focus)
│   │   ├── useUpdateScript.ts
│   │   ├── useDeleteScript.ts   ← takes raw UUID string
│   │   ├── useListScriptParts.ts
│   │   ├── useReorderScriptParts.ts
│   │   └── useSelectFocusedScript.ts
│   ├── scriptTags/
│   │   ├── scriptTagQueryKeys.ts
│   │   ├── useListScriptTags.ts ← returns { scriptTags }
│   │   ├── useCreateScriptTag.ts
│   │   ├── useUpdateScriptTag.ts
│   │   └── useDeleteScriptTag.ts
│   ├── scriptChapters/
│   │   ├── useCreateScriptChapter.ts
│   │   ├── useUpdateScriptChapter.ts
│   │   └── useDeleteScriptChapter.ts
│   ├── scriptVoiceOvers/  (same CRUD pattern)
│   ├── scriptDialogues/   (same CRUD pattern)
│   ├── scriptShots/       (same CRUD pattern)
│   ├── scriptTexts/       (same CRUD pattern)
│   ├── scriptCallToActions/  (same CRUD pattern)
│   ├── scriptRetentionCues/  (same CRUD pattern)
│   ├── scriptHooks/         (same CRUD pattern)
│   ├── hookTemplates/
│   │   ├── hookTemplateQueryKeys.ts
│   │   ├── useListPaginatedHookTemplates.ts  ← infinite scroll (page/limit/hasMore)
│   │   ├── useListHookTemplates.ts
│   │   ├── useCreateHookTemplate.ts
│   │   ├── useUpdateHookTemplate.ts
│   │   └── useDeleteHookTemplate.ts
│   └── dialogueSubjects/
│       ├── useCreateDialogueSubject.ts  ← uses scriptDialogueUuid
│       ├── useUpdateDialogueSubject.ts
│       └── useDeleteDialogueSubject.ts
├── stores/scripts/
│   ├── focusScriptStore.ts          ← persisted, key "app:scripts:focused"
│   ├── scriptEditorStore.ts          ← persisted, key "app:scripts:editor" (meta header + parts expanded)
│   ├── calendarStore.ts             ← persisted, key "app:scripts:calendar" (month/year nav + filters)
│   └── scriptRightPanelStore.ts    ← persisted, key "app:scripts:right-panel" (ScriptRightPanel.Generate, ScriptRightPanel.HookTemplates)
├── helpers/
│   └── hookPlaceholderParser.ts    ← parseHookPlaceholders, hasPlaceholders, replacePlaceholder, insertPlaceholder, formatPlaceholderToken
├── routes/
│   └── scripts.tsx              ← thin route, delegates to ScriptPageView
└── components/scripts/
    ├── ScriptPageView.tsx
    ├── ScriptListPanel.tsx
    ├── ScriptListItem.tsx
    ├── ScriptSimpleMetaCol.tsx      ← compact read-only meta (platforms, tag dots, date)
    ├── ScriptEditorPanel.tsx
    ├── ScriptMetaHeader.tsx
    ├── ScriptTagsRow.tsx
    ├── UpdateScriptTagDropdown.tsx
    ├── ScriptPlatformsRow.tsx
    ├── calendar/
    │   ├── index.ts                 ← barrel export
    │   ├── ScriptCalendar.tsx       ← monthly calendar with nav + grid + filter panel + behavior
    │   ├── CalendarFilterPanel.tsx  ← left panel with platform/status/tag toggle pills
    │   ├── ScriptCalendarDayCell.tsx ← individual day cell (droppable)
    │   ├── ScriptCalendarCard.tsx   ← compact script card (draggable)
    │   └── ScriptDetailModal.tsx    ← full editor modal (wraps ScriptEditorPanel)
    ├── hookTemplates/
    │   ├── HookTemplatePanel.tsx     ← right-side panel (SidePanel, w-72) with search, category filter, infinite scroll
    │   ├── HookTemplateCard.tsx      ← clickable card showing title + placeholder pills
    │   ├── ApplyHookTemplateModal.tsx ← confirmation dialog (ModalOverlay)
    │   └── CreateHookTemplateModal.tsx ← creation modal with placeholder palette
    └── parts/
        ├── ScriptHookCard.tsx        ← hook part card (always first, not draggable, auto-save on blur, InboxStackIcon for template panel)
        ├── HookContentRenderer.tsx   ← placeholder-aware rendering with popover input for replacement
        ├── ScriptPartsList.tsx       ← DnD orchestrator
        ├── ScriptPartCard.tsx       ← reusable card wrapper (header, delete, headerActions, animation)
        ├── ScriptPartHeader.tsx     ← reusable colored header (icon + label, drag handle)
        ├── ScriptChapterCard.tsx
        ├── ScriptVoiceOverCard.tsx
        ├── ScriptDialogueCard.tsx
        ├── ScriptShotCard.tsx
        ├── ScriptTextCard.tsx         ← borderless, auto-save on blur
        ├── ScriptCallToActionCard.tsx ← CTA card with type selector + content
        ├── ScriptRetentionCueCard.tsx ← retention cue card with type selector + content
        ├── DialogueSubjectRow.tsx    ← inline-editable subject line
        ├── AddDialogueSubjectRow.tsx ← inline subject creation
        └── AddScriptPartMenu.tsx     ← "+ Add part" dropdown (hides Hook when one already exists)
```

---

## Key Patterns

### Infinite Scroll Pagination
`ScriptListPanel` uses infinite scroll to load scripts page by page. `useListPaginatedScripts` manages page/additionalScripts/hasMore/isLoadingMore state (same pattern as `useListPaginatedPosts`). Accepts an optional `status?: ScriptStatus` prop to filter scripts by status — when provided, only scripts matching that status are returned. The query key includes the status so React Query refetches when the filter changes. A sentinel `<div>` at the bottom of the list is observed via the `useInfiniteScroll` hook (rootMargin `200px`) to call `listMore()` when the user scrolls near the end. The API sends `page`, `limit`, and optionally `status` query params; `hasMore` is determined by `count === limit`.

### Script Creation (no modal)
Clicking "+ New script" in `ScriptListPanel` calls `useCreateScript` directly with a default title `"Nouveau script"`. Since `useCreateScript.mutationFn` returns the full `Script` object, the new UUID is immediately available to set as focused, opening the editor instantly.

### ScriptPart Discriminated Union
Each part class has a `readonly type` literal field:
```ts
class ScriptHook { public readonly type = 'hook' as const; ... }
class ScriptChapter { public readonly type = 'chapter' as const; ... }
class ScriptVoiceOver { public readonly type = 'voice_over' as const; ... }
class ScriptDialogue { public readonly type = 'dialogue' as const; ... }
class ScriptShot { public readonly type = 'shot' as const; ... }
class ScriptText { public readonly type = 'text' as const; ... }
class ScriptCallToAction { public readonly type = 'call_to_action' as const; ... }
class ScriptRetentionCue { public readonly type = 'retention_cue' as const; ... }

export type ScriptPart = ScriptHook | ScriptChapter | ScriptVoiceOver | ScriptDialogue | ScriptShot | ScriptText | ScriptCallToAction | ScriptRetentionCue;
```
`useListScriptParts` maps the heterogeneous API response via `scriptPartFromJSON(json)` which switches on `json.type`.

### Inline Editing Pattern (Auto-save on Blur)
All part cards and `DialogueSubjectRow` use the same inline editing pattern — fields are always editable with auto-save on blur. There is no view/edit toggle, no Save/Cancel buttons.

**How it works:**
- Each field maintains local state (e.g. `useState(chapter.title)`)
- On `onBlur`, the handler compares the trimmed local value against the prop value
- If changed, the update mutation fires with only the changed field
- For enum types (chapterType, tone, shotType), a `SelectDropdown` renders a clickable `Pill` trigger that opens a dropdown of `Pill` options — auto-saves on select
- Input/TextArea use the `simple` prop for borderless inline styling
- Delete button is hover-revealed (`opacity-0 group-hover:opacity-100`)

**Structured part cards** (chapter, voice-over, dialogue, shot, text) all use `ScriptPartCard` as their wrapper component. `ScriptPartCard` handles:
- Rendering `ScriptPartHeader` with icon, label, and color resolved from centralized maps in `ScriptPartType.ts`
- Standardized delete action ("Supprimer" text, hover-revealed)
- Optional card border (`bordered` prop, default true)
- Store-driven header expand/collapse: reads `arePartsExpanded` from `useScriptEditorStore` — when false, the header + delete action are hidden with a smooth CSS grid animation (`grid-rows-[0fr]`/`[1fr]` + opacity transition); children (content) remain always visible

Each part type has its own color: hook (red), chapter (blue), voice-over (yellow), shot (primary), dialogue (purple), text (gray), call-to-action (orange), retention cue (pink).

### Hook Card
`ScriptHookCard` is a part-based card rendered above the DnD list inside `ScriptPartsList`. It follows the same pattern as other part cards — content auto-saves on blur via `useUpdateScriptHook`, delete via `useDeleteScriptHook`. Wrapped in `ScriptPartCard` with `partType={ScriptPartType.Hook}` (red color). Not draggable (always first, position 0). Only one hook is allowed per script per generation compartment — `AddScriptPartMenu` hides the Hook option when one already exists.

The card has an `InboxStackIcon` button (hover-revealed, passed via `headerActions` prop to `ScriptPartCard`) that toggles the `HookTemplatePanel` via `useScriptRightPanelStore.togglePanel(ScriptRightPanel.HookTemplates)`.

**Conditional rendering:** When the hook content has placeholders (`hasPlaceholders(content)`), `HookContentRenderer` is rendered instead of the plain `TextArea`. Once all placeholders are filled, the card switches back to the standard `TextArea`.

### Hook Content Renderer
`HookContentRenderer` is a placeholder-aware content display component used inside `ScriptHookCard`. It parses the hook content via `parseHookPlaceholders()` and renders text segments inline alongside placeholder tokens displayed as clickable `Pill` components (purple-tinted: `bg-primary/10`, `border-primary/30`, `text-primary`).

Clicking a placeholder pill opens a popover input (positioned below the pill, `z-30`, with a fixed backdrop for dismiss). The user types a replacement value and confirms with Enter or blur — the placeholder is replaced in the content via `replacePlaceholder()` and auto-saved via `useUpdateScriptHook`. Escape cancels the popover.

### Hook Template Integration
`ScriptHook` has an optional `hookTemplate` field (`HookTemplate | undefined`). When a template is applied, this field references the source template. Template application calls `useUpdateScriptHook` with `{ content: template.content, hookTemplateUuid: template.uuid }`.

### ScriptPartCard headerActions
`ScriptPartCard` accepts an optional `headerActions` prop (`React.ReactNode`) rendered between the part type pill and the delete button. Used by `ScriptHookCard` to render the `InboxStackIcon` template library toggle button.

### Hook Placeholder System
Templates use `[placeholder]` tokens (e.g., `[topic]`, `[audience]`) that users fill in after applying a template.

**Shared helper** (`~/helpers/hookPlaceholderParser.ts`):
- `parseHookPlaceholders(content)`: Splits text into `HookPart[]` with `type: 'text' | 'placeholder'`
- `hasPlaceholders(content)`: Returns `true` if any `[...]` tokens remain
- `formatPlaceholderToken(placeholder)`: Returns `[key]` — single source of truth for the token format
- `insertPlaceholder(content, placeholder, cursorStart, cursorEnd)`: Inserts `[key]` at cursor position, returns `{ content, cursorPosition }`
- `replacePlaceholder(content, placeholder, value)`: Replaces all `[key]` occurrences with `value`

### Text Part (Notebook-Style)
`ScriptTextCard` is a borderless, always-editable text block that blends into the page:
- **Always editable:** No view/edit toggle, uses a `simple` TextArea
- **Auto-save on blur:** Calls `updateScriptText` when content changes
- **No card border:** Only shows drag handle + delete button on hover (`opacity-0 group-hover:opacity-100`)
- **Virtual mode:** A virtual `ScriptTextCard` (no `text` prop) is rendered at the bottom of the parts list whenever the list is empty OR the last part is not a text. This lets the user start writing at any time. On first blur with non-empty content, it creates a real entity via `createScriptText`

### Drag-and-Drop
Uses `@dnd-kit/core` (`useDraggable`, `useDroppable`, `DndContext`, `DragOverlay`). Parts are reordered optimistically in local state, then `useReorderScriptParts` fires with the new ordered array of `{uuid, type}`. If `parts` prop changes while no drag is active, local state is synced.

### Platform Management
- `ScriptPlatformsRow` renders all platform icons as `Pill` components (via a local `PlatformPill` wrapper that resolves the icon URL), positioned to the right of the title
- **Optimistic updates:** Local state (`localPlatforms`) updates immediately on click. A `useRef` counter tracks in-flight mutations — prop sync from cache invalidation is suppressed while mutations are pending, preventing flicker during rapid clicks. On error, local state rolls back to the previous value.
- **Unselected:** `grayscale opacity-40` — icon appears gray/faded, `hover:opacity-60` on hover
- **Selected:** full color, `opacity-100`
- On click: toggles the platform (add/remove), calls `useUpdateScript` with the full `platforms` array
- Icons are 20px (`size-5`) with `transition-all` for smooth visual feedback

### Status Management
- Status uses `SelectDropdown` + `Pill` pattern (same as `ScriptShotCard` for `ShotType`)
- Local state tracks the selected `ScriptStatus` for immediate UI feedback
- On select: calls `useUpdateScript` with the new `status` value
- Uses `scriptStatusToLabel`, `scriptStatusToBgClass`, `scriptStatusToTextClass` for Pill rendering
- Colors: Pending (green), InProgress (yellow), Completed (purple)

### Tag Management
- Architecture mirrors the TodoListTag system (same component/hook decomposition)
- `ScriptTagsRow` shows assigned tags as colored `Pill` components with `×` to remove, and a trigger `Pill` ("Tag") to open the dropdown
- Uses optimistic local state with `useRef` pending counter (same pattern as `ScriptPlatformsRow`) for immediate UI feedback
- `ListScriptTagsDropdown` is a reusable dropdown component (mirrors `ListTodoListTagsDropdown`):
  - Props: `{ projectUuid, selectedTags, onClose, onTagSelected, onTagDeleted? }`
  - Search input doubles as the "create" title field
  - Uses `useListScriptTagsWithSearch` (debounced 300ms search via `GET /scripts/tags?projectUuid=...&searchTerm=...`)
  - Shows matching tags as `Pill` (filtered by `selectedTags`), each with `...` suffix icon to open `UpdateScriptTagDropdown`
  - When no matches and title is not empty: shows color picker + "Créer {title}" button via `useCreateScriptTag`
  - When nothing typed and no tags: shows hint "Commencez à écrire pour créer un nouveau tag."
- `UpdateScriptTagDropdown` allows editing tag title/color and deleting the tag (with `ConfirmDeleteDialog` confirmation) — mirrors the `UpdateTodoListTagDropdown` pattern from the Tasks feature
- `useCreateScriptTag` takes `{ projectUuid }` as hook constructor param (mirroring `useCreateTodoListTag`)
- Toggle/remove calls `useUpdateScript` with the full new `tagUuids` array
- Tag deletion uses `useDeleteScriptTag` which invalidates both `scriptTagQueryKeys.all` and `scriptQueryKeys.all`
- `useListScriptTags` (without search) remains available for calendar filtering

### Dialogue Subjects
`ScriptDialogueCard` always renders the subjects list below the header. `DialogueSubjectRow` is always inline-editable (speaker + content fields auto-save on blur). `AddDialogueSubjectRow` provides inline creation. The create hook uses `scriptDialogueUuid` (not `dialogueUuid`).

---

## Data Interfaces

### Mutation Hooks — Key Props

| Hook | Data Interface Key Points |
|------|---------------------------|
| `useDeleteScript` | Takes raw `string` UUID (not an object) |
| `useListScriptTags` | Returns `{ scriptTags }` — for calendar (no search) |
| `useListScriptTagsWithSearch` | Returns `{ searchTerm, setSearchTerm, scriptTags, isLoading }` — for dropdown |
| `useCreateScriptTag` | Takes `{ projectUuid }` as hook constructor, mutation data: `{ title, color }` |
| `useUpdateScriptTag` | Takes `{ tagUuid, title, color }` |
| `useDeleteScriptTag` | Takes raw `string` UUID |
| `useCreateDialogueSubject` | Uses `scriptDialogueUuid` |
| `useUpdateDialogueSubject` | Takes `{ subjectUuid, scriptUuid, speaker?, content? }` — no dialogueUuid |
| `useDeleteDialogueSubject` | Takes `{ subjectUuid, scriptUuid }` — no dialogueUuid |
| `useReorderScriptParts` | Takes `{ scriptUuid, orderedParts: { uuid, type }[] }` |
| `useUpdateScriptHook` | Takes `{ hookUuid, scriptUuid, data: { content?, hookTemplateUuid? } }` |
| `useListPaginatedHookTemplates` | Infinite scroll (page/limit/hasMore), optional `searchTerm` |

### Models

**ScriptHook** (updated):
```ts
class ScriptHook {
    readonly type = 'hook' as const
    uuid: string
    content: string
    position: number
    createdAt: Date
    updatedAt?: Date
    generationUuid?: string
    hookTemplate?: HookTemplate    // linked template reference (nullable)
}
```

**HookTemplate:**
```ts
class HookTemplate {
    uuid: string
    title: string
    content: string              // template text with [placeholder] tokens
    isPublic: boolean
    createdAt: Date
    updatedAt?: Date
}
```

---

## Query Keys

```ts
scriptQueryKeys.all                                          // ['scripts']
scriptQueryKeys.list(uuid, status?)                           // ['scripts', 'list', projectUuid, status?]
scriptQueryKeys.calendar(uuid, year, month)                  // ['scripts', 'calendar', projectUuid, year, month]
scriptQueryKeys.parts(uuid)                                  // ['scripts', 'parts', scriptUuid]

scriptTagQueryKeys.all                   // ['scriptTags']
scriptTagQueryKeys.list(uuid, search?)   // ['scriptTags', 'list', projectUuid, searchTerm?]

hookTemplateQueryKeys.all        // ['hookTemplates']
hookTemplateQueryKeys.list(term) // ['hookTemplates', 'list', term ?? '']
```

All part mutations (chapters, voice-overs, dialogues, shots, texts, call-to-actions, retention cues, hooks, dialogue subjects) invalidate `scriptQueryKeys.parts(scriptUuid)`. All hook template mutations invalidate `hookTemplateQueryKeys.all`. Script tag mutations (`useUpdateScriptTag`, `useDeleteScriptTag`) invalidate both `scriptTagQueryKeys.all` and `scriptQueryKeys.all`.

---

## Calendar

### Overview

`ScriptCalendar` is a standalone monthly calendar component that displays planned scripts by their `publishedAt` date. It has its own dedicated page at `/calendar`.

**Route:** `/calendar` (`front/app/routes/calendar.tsx`)

### Component Tree

```
CalendarPage (route)
  ├── CalendarFilterPanel (reads from calendarStore)
  │     ├── Plateformes: PlatformPill[] (toggle platform filter)
  │     ├── Statuts: Pill[] (toggle status filter)
  │     └── Tags: Pill[] (toggle tag filter, from useListScriptTags)
  └── ScriptCalendar (reads from calendarStore)
        ├── Header: < Month Year > + "Aujourd'hui" button
        ├── Day headers: Lun, Mar, Mer, Jeu, Ven, Sam, Dim
        └── ScriptCalendarDayCell[] (per day in month)
              ├── Day number (today = primary circle)
              ├── "+" button (hover-revealed, creates script on that date)
              └── ScriptCalendarCard[] (per script on that day)
                    ├── Title (text-heading-xs, truncated)
                    └── Platform icons + tag color dots
```

### File Structure

```
front/app/utils/
└── dateHelpers.ts               ← shared calendar helpers (DAYS_FR, MONTHS_FR, getDaysInMonth, etc.)

front/app/components/scripts/calendar/
├── index.ts                     ← barrel export
├── ScriptCalendar.tsx           ← main component (filter state + month nav + grid + behavior)
├── CalendarFilterPanel.tsx      ← left panel with platform/status/tag toggle pills
├── ScriptCalendarDayCell.tsx    ← individual day cell (droppable)
├── ScriptCalendarCard.tsx       ← compact script card (draggable)
└── ScriptDetailModal.tsx        ← full editor modal (wraps ScriptEditorPanel)
```

### Props

**ScriptCalendar:**
| Prop | Type | Description |
|------|------|-------------|
| `projectUuid` | `string` | Project UUID for data fetching, script creation, and editor panel |

### API Endpoint

**`GET /api/scripts/calendar`** — Returns scripts for a given month, grouped by day.

| Param | Type | Description |
|-------|------|-------------|
| `projectUuid` | `string` | Required |
| `year` | `int` | Required, positive |
| `month` | `int` | Required, 1-12 |

**Response:** `ListScriptsGroupedByDayResponseDTO[]` — array of `{ date: "YYYY-MM-DD", scripts: Script[] }`. Only days with scripts are included. Backend groups scripts by `publishedAt` date and returns them ordered by `publishedAt ASC`.

**Frontend DTO:** `ListScriptsGroupedByDayDTO` (in `front/app/models/dtos/`) mirrors the backend response with `fromJSON` factory.

**Frontend hook:** `useListCalendarScripts({ projectUuid, year, month })` — returns `{ scriptsByDay: ListScriptsGroupedByDayDTO[] }`. The calendar converts this to a `Map<string, Script[]>` keyed by date.

### Key Details

- **Self-contained data fetching:** The calendar fetches its own data via `useListCalendarScripts` — no scripts prop needed. When the user navigates months, React Query caches each month separately via `scriptQueryKeys.calendar(projectUuid, year, month)`.
- **Zustand store (`calendarStore`):** Filter state (`selectedPlatforms`, `selectedStatuses`, `selectedTagUuids`) and month navigation (`currentMonth`, `currentYear`) are persisted in `useCalendarStore` (key `"app:scripts:calendar"`). Both `CalendarFilterPanel` and `ScriptCalendar` read from the store directly — no prop drilling.
- **Client-side filtering:** All scripts for a month are fetched once from the API (no filter params sent). Filtering by platforms, statuses, and tags is applied client-side in a `useMemo` inside `ScriptCalendar`. Default state: nothing selected = show all scripts (including those with no platforms/status/tags). When the user selects specific filters, only matching scripts are shown. Selecting all options for a dimension returns to "show all" behavior. Empty day groups are removed after filtering.
- **Filter panel:** `CalendarFilterPanel` renders three sections (Plateformes, Statuts, Tags) with toggleable `Pill` components. None selected by default (= show all). Platform pills use the `PlatformPill` pattern with `platformToIcon` from the `Platform` enum. Status pills use `scriptStatusToIcon`/`scriptStatusToLabel`. Tag pills use `colorToBgClass`/`colorToTextClass`. Tags are fetched via `useListScriptTags`.
- **Self-contained behavior:** The calendar handles all actions internally — no callback props needed. Uses `useUpdateScript` for DnD date changes, `useCreateScript` for the "+" button, and local `selectedScript` state for the detail modal.
- **Shared date helpers:** `DAYS_FR`, `MONTHS_FR`, `getDaysInMonth`, `getFirstDayOfMonth`, `isSameDay`, `isPastDay`, `toDateKey` are shared between `ScriptCalendar` and `DatePicker` via `~/utils/dateHelpers`.
- **Monday-first grid:** Same weekday logic as `DatePicker`
- **Server-side grouping:** Scripts are grouped by day on the backend. The frontend receives pre-grouped `ListScriptsGroupedByDayDTO[]` and converts to `Map<string, Script[]>`.
- **Month navigation:** Local `useState` (not persisted), `<` / `>` arrows + "Aujourd'hui" reset button. Month is 0-indexed in JS, converted to 1-indexed for the API.
- **Drag-and-drop:** Uses `@dnd-kit/core` — `ScriptTile` is `useDraggable`, day cells are `useDroppable`. The `DndContext` is provided by each consumer: `HomeScriptsSection` (home page, enables dragging from the unscheduled list onto the calendar) and `calendar.tsx` route (enables rescheduling scripts between days). Both use `PointerSensor` with 8px activation constraint, `DragOverlay` with rotated shadow preview, and `useUpdateScript` to persist the new `publishedAt` date.
- **Day cells:** flex-col layout with `overflow-hidden`, scripts list uses `flex-1 min-h-0 overflow-y-auto scrollbar-none`
- **"+" button:** Hover-revealed (`opacity-0 group-hover:opacity-100`), creates a "Nouveau script" with the day's date pre-filled
- **Detail modal:** `ScriptDetailModal` wraps `ScriptEditorPanel` inside `ModalOverlay`. Clicking a script card opens the full editor (title, platforms, tags, status, date, hook, parts). Uses `key={script.uuid}` to reset on script change.

---

## Sidebar Integration

Nav items in `SideBar.tsx`:

| Route | Icon (outline / solid) | Label |
|-------|------------------------|-------|
| `/scripts` | `ClipboardDocumentCheckIcon` / `ClipboardDocumentCheckIconSolid` | Script |
| `/calendar` | `CalendarDaysIcon` / `CalendarDaysIconSolid` | Calendrier |
