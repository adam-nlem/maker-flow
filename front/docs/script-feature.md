# Script Feature — Frontend Documentation

## Overview

The Script feature provides a split-view editor for managing scripts per project. Users create scripts, edit their metadata (title, hook, publication date, tags, platforms, status), and build structured content with five part types: chapters, voice-overs, dialogues, shots, and texts. Parts are reorderable via drag-and-drop. Text parts provide a notebook-style editing experience with auto-save on blur.

**Route:** `/scripts`

---

## Architecture

### Split-View Layout

```
ScriptPageView (flex-row h-screen)
  ├── ScriptListPanel (w-72, left panel)
  │     ├── ScriptListItem[] (per script)
  │     └── "+ New script" button (inline creation)
  └── ScriptEditorPanel (flex-1, right panel)
        ├── ScriptMetaHeader
        │     ├── [title input] + [ScriptPlatformsRow] (same row, icons right-aligned)
        │     ├── ScriptTagsRow (tag pills + popover)
        │     ├── status SelectDropdown (Pill trigger)
        │     └── date picker (CalendarDaysIcon button)
        ├── ScriptHookCard (hook textarea + template toggle)
        └── ScriptPartsList (flex-1 overflow-y-auto)
              ├── DnD-reorderable part cards
              └── AddScriptPartMenu (sticky bottom)
```

### File Structure

```
front/app/
├── models/
│   ├── Script.ts
│   ├── ScriptTag.ts
│   ├── ScriptPart.ts            ← union type + scriptPartFromJSON factory
│   ├── ScriptChapter.ts         ← type = 'chapter' as const
│   ├── ScriptVoiceOver.ts       ← type = 'voice_over' as const
│   ├── ScriptDialogue.ts        ← type = 'dialogue' as const
│   ├── ScriptShot.ts            ← type = 'shot' as const
│   ├── ScriptText.ts            ← type = 'text' as const
│   ├── DialogueSubject.ts
│   └── enums/
│       ├── ScriptPartType.ts    ← with french translation + icon maps
│       ├── ScriptStatus.ts      ← with label/bg/text class maps (pending, in_progress, completed)
│       ├── ChapterType.ts       ← with label/bg/text class maps
│       ├── VoiceOverType.ts     ← with label/bg/text class maps
│       └── ShotType.ts          ← with label/bg/text class maps
├── hooks/api/
│   ├── scripts/
│   │   ├── scriptQueryKeys.ts   ← all, list(projectUuid), parts(scriptUuid)
│   │   ├── useListPaginatedScripts.ts  ← infinite scroll (page/limit/hasMore)
│   │   ├── useCreateScript.ts   ← returns Script (for immediate focus)
│   │   ├── useUpdateScript.ts
│   │   ├── useDeleteScript.ts   ← takes raw UUID string
│   │   ├── useListScriptParts.ts
│   │   ├── useReorderScriptParts.ts
│   │   └── useSelectFocusedScript.ts
│   ├── scriptTags/
│   │   ├── scriptTagQueryKeys.ts
│   │   ├── useListScriptTags.ts ← returns { scriptTags }
│   │   └── useCreateScriptTag.ts
│   ├── scriptChapters/
│   │   ├── useCreateScriptChapter.ts
│   │   ├── useUpdateScriptChapter.ts
│   │   └── useDeleteScriptChapter.ts
│   ├── scriptVoiceOvers/  (same CRUD pattern)
│   ├── scriptDialogues/   (same CRUD pattern)
│   ├── scriptShots/       (same CRUD pattern)
│   ├── scriptTexts/       (same CRUD pattern)
│   └── dialogueSubjects/
│       ├── useCreateDialogueSubject.ts  ← uses scriptDialogueUuid
│       ├── useUpdateDialogueSubject.ts
│       └── useDeleteDialogueSubject.ts
├── helpers/
│   └── hookPlaceholderParser.ts  ← shared parser for [placeholder] tokens
├── stores/scripts/
│   └── focusScriptStore.ts      ← persisted, key "app:scripts:focused"
├── routes/
│   └── scripts.tsx              ← thin route, delegates to ScriptPageView
└── components/scripts/
    ├── ScriptPageView.tsx
    ├── ScriptListPanel.tsx
    ├── ScriptListItem.tsx
    ├── ScriptEditorPanel.tsx
    ├── ScriptMetaHeader.tsx
    ├── ScriptTagsRow.tsx
    ├── ScriptPlatformsRow.tsx
    └── parts/
        ├── ScriptHookCard.tsx        ← hook card with template toggle + placeholder editing
        ├── HookContentRenderer.tsx   ← rich text with clickable placeholder pills
        ├── ScriptPartsList.tsx       ← DnD orchestrator
        ├── ScriptPartHeader.tsx     ← reusable colored header (icon + label, drag handle)
        ├── ScriptChapterCard.tsx
        ├── ScriptVoiceOverCard.tsx
        ├── ScriptDialogueCard.tsx
        ├── ScriptShotCard.tsx
        ├── ScriptTextCard.tsx         ← borderless, auto-save on blur
        ├── DialogueSubjectRow.tsx    ← inline-editable subject line
        ├── AddDialogueSubjectRow.tsx ← inline subject creation
        └── AddScriptPartMenu.tsx     ← "+ Add part" dropdown
```

---

## Key Patterns

### Infinite Scroll Pagination
`ScriptListPanel` uses infinite scroll to load scripts page by page. `useListPaginatedScripts` manages page/additionalScripts/hasMore/isLoadingMore state (same pattern as `useListPaginatedPosts`). A sentinel `<div>` at the bottom of the list triggers an `IntersectionObserver` (rootMargin `200px`) to call `listMore()` when the user scrolls near the end. The API sends `page` and `limit` query params; `hasMore` is determined by `count === limit`.

### Script Creation (no modal)
Clicking "+ New script" in `ScriptListPanel` calls `useCreateScript` directly with a default title `"Nouveau script"`. Since `useCreateScript.mutationFn` returns the full `Script` object, the new UUID is immediately available to set as focused, opening the editor instantly.

### ScriptPart Discriminated Union
Each part class has a `readonly type` literal field:
```ts
class ScriptChapter { public readonly type = 'chapter' as const; ... }
class ScriptVoiceOver { public readonly type = 'voice_over' as const; ... }
class ScriptDialogue { public readonly type = 'dialogue' as const; ... }
class ScriptShot { public readonly type = 'shot' as const; ... }
class ScriptText { public readonly type = 'text' as const; ... }

export type ScriptPart = ScriptChapter | ScriptVoiceOver | ScriptDialogue | ScriptShot | ScriptText;
```
`useListScriptParts` maps the heterogeneous API response via `scriptPartFromJSON(json)` which switches on `json.type`.

### Inline Editing Pattern (Auto-save on Blur)
All part cards and `DialogueSubjectRow` use the same inline editing pattern — fields are always editable with auto-save on blur. There is no view/edit toggle, no Save/Cancel buttons.

**How it works:**
- Each field maintains local state (e.g. `useState(chapter.title)`)
- On `onBlur`, the handler compares the trimmed local value against the prop value
- If changed, the update mutation fires with only the changed field
- For enum types (chapterType, voiceOverType, shotType), a `SelectDropdown` renders a clickable `Pill` trigger that opens a dropdown of `Pill` options — auto-saves on select
- Input/TextArea use the `simple` prop for borderless inline styling
- Delete button is hover-revealed (`opacity-0 group-hover:opacity-100`)

**Structured part cards** (chapter, voice-over, dialogue, shot) use `ScriptPartHeader` as a colored header bar (icon + label) that doubles as the drag handle. Each part type has its own color: chapter (blue), voice-over (yellow), shot (primary), dialogue (purple), hook (primary). **Text parts** are borderless to blend into the page.

### Hook Card
`ScriptHookCard` is a standalone card rendered above the parts list inside `ScriptPartsList`. It uses the same visual pattern as structured part cards (`border border-light-gray rounded-xl p-4 bg-clear`) with a `ScriptPartHeader` (CheckBadgeIcon, primary color). It is not reorderable and has no delete button. A `Button` opens/closes the hook template panel.

**Placeholder editing:** When the hook text contains `[placeholder]` tokens, `HookContentRenderer` displays them as clickable `Pill` components inline with the text. Clicking a pill opens a popover input to replace the placeholder value. Once all placeholders are filled, the card switches to a plain `TextArea` for free-form editing. The component uses `key={script.hookTemplate?.uuid}` on mount to reset local state when a new template is applied.

**Shared parser:** `hookPlaceholderParser.ts` exports `parseHookPlaceholders(content)` (returns `HookPart[]` with `type: 'text' | 'placeholder'`) and `hasPlaceholders(content)`. Used by both `HookContentRenderer` (interactive editing) and `HookTemplateCard` (display preview).

### Text Part (Notebook-Style)
`ScriptTextCard` is a borderless, always-editable text block that blends into the page:
- **Always editable:** No view/edit toggle, uses a `simple` TextArea
- **Auto-save on blur:** Calls `updateScriptText` when content changes
- **No card border:** Only shows drag handle + delete button on hover (`opacity-0 group-hover:opacity-100`)
- **Virtual mode:** When a script has no parts, a virtual `ScriptTextCard` (no `text` prop) is rendered. On first blur with non-empty content, it creates a real entity via `createScriptText`

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
- `ScriptTagsRow` lists assigned tags as colored pills with `×` to remove
- A `+` button opens a popover showing unassigned tags from `useListScriptTags`
- The popover also has an inline form to create new tags via `useCreateScriptTag`
- Toggle/remove calls `useUpdateScript` with the full new `tagUuids` array
- **Note:** `useListScriptTags` returns `{ scriptTags }` (not `{ tags }`)

### Dialogue Subjects
`ScriptDialogueCard` always renders the subjects list below the header. `DialogueSubjectRow` is always inline-editable (speaker + content fields auto-save on blur). `AddDialogueSubjectRow` provides inline creation. The create hook uses `scriptDialogueUuid` (not `dialogueUuid`).

---

## Data Interfaces

### Mutation Hooks — Key Props

| Hook | Data Interface Key Points |
|------|---------------------------|
| `useDeleteScript` | Takes raw `string` UUID (not an object) |
| `useListScriptTags` | Returns `{ scriptTags }` |
| `useCreateDialogueSubject` | Uses `scriptDialogueUuid` |
| `useUpdateDialogueSubject` | Takes `{ subjectUuid, scriptUuid, speaker?, content? }` — no dialogueUuid |
| `useDeleteDialogueSubject` | Takes `{ subjectUuid, scriptUuid }` — no dialogueUuid |
| `useReorderScriptParts` | Takes `{ scriptUuid, orderedParts: { uuid, type }[] }` |

---

## Query Keys

```ts
scriptQueryKeys.all           // ['scripts']
scriptQueryKeys.list(uuid)    // ['scripts', 'list', projectUuid]
scriptQueryKeys.parts(uuid)   // ['scripts', 'parts', scriptUuid]

scriptTagQueryKeys.all        // ['script-tags']
scriptTagQueryKeys.list(uuid) // ['script-tags', 'list', projectUuid]
```

All part mutations (chapters, voice-overs, dialogues, shots, texts, dialogue subjects) invalidate `scriptQueryKeys.parts(scriptUuid)`.

---

## Sidebar Integration

The Scripts nav item in `SideBar.tsx` uses:
- `PencilSquareIcon` (outline) / `PencilSquareIconSolid` (solid) from `@heroicons/react`
- Route: `/scripts`
- Active when: `location.pathname.startsWith('/scripts')`
