# Script Feature — Frontend Documentation

## Overview

The Script feature provides a split-view editor for managing scripts per project. Users create scripts, edit their metadata (title, hook, publication date, tags), and build structured content with five part types: chapters, voice-overs, dialogues, shots, and texts. Parts are reorderable via drag-and-drop. Text parts provide a notebook-style editing experience with auto-save on blur.

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
        │     ├── title input (auto-save on blur)
        │     ├── hook textarea (auto-save on blur)
        │     ├── ScriptTagsRow (tag pills + popover)
        │     └── date picker (native input[type=date])
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
│       ├── ScriptPartType.ts
│       ├── ChapterType.ts       ← with label/bg/text class maps
│       ├── VoiceOverType.ts     ← with label/bg/text class maps
│       └── ShotType.ts          ← with label/bg/text class maps
├── hooks/api/
│   ├── scripts/
│   │   ├── scriptQueryKeys.ts   ← all, list(projectUuid), parts(scriptUuid)
│   │   ├── useListScripts.ts
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
    └── parts/
        ├── ScriptPartsList.tsx       ← DnD orchestrator
        ├── ScriptChapterCard.tsx
        ├── ScriptVoiceOverCard.tsx
        ├── ScriptDialogueCard.tsx
        ├── ScriptShotCard.tsx
        ├── ScriptTextCard.tsx         ← borderless, auto-save on blur
        ├── DialogueSubjectRow.tsx    ← read/edit subject line
        ├── AddDialogueSubjectRow.tsx ← inline subject creation
        └── AddScriptPartMenu.tsx     ← "+ Add part" dropdown
```

---

## Key Patterns

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

### Inline Editing Pattern
Each part card maintains local `isEditing: boolean` state. In edit mode, form fields replace the read view. On "Enregistrer" the mutation fires, on "Annuler" local state is reset from the prop.

### Auto-save on Blur (ScriptMetaHeader, ScriptTextCard)
Title and hook fields call `updateScript` only when the value has actually changed from the original `script.title` / `script.hook`. `ScriptTextCard` follows the same pattern — auto-saves on blur when content has changed.

### Text Part (Notebook-Style)
`ScriptTextCard` is a borderless, always-editable text block that blends into the page:
- **Always editable:** No view/edit toggle, uses a `simple` TextArea
- **Auto-save on blur:** Calls `updateScriptText` when content changes
- **No card border:** Only shows drag handle + delete button on hover (`opacity-0 group-hover:opacity-100`)
- **Virtual mode:** When a script has no parts, a virtual `ScriptTextCard` (no `text` prop) is rendered. On first blur with non-empty content, it creates a real entity via `createScriptText`

### Drag-and-Drop
Uses `@dnd-kit/core` (`useDraggable`, `useDroppable`, `DndContext`, `DragOverlay`). Parts are reordered optimistically in local state, then `useReorderScriptParts` fires with the new ordered array of `{uuid, type}`. If `parts` prop changes while no drag is active, local state is synced.

### Tag Management
- `ScriptTagsRow` lists assigned tags as colored pills with `×` to remove
- A `+` button opens a popover showing unassigned tags from `useListScriptTags`
- The popover also has an inline form to create new tags via `useCreateScriptTag`
- Toggle/remove calls `useUpdateScript` with the full new `tagUuids` array
- **Note:** `useListScriptTags` returns `{ scriptTags }` (not `{ tags }`)

### Dialogue Subjects
`ScriptDialogueCard` always renders the subjects list below the header (no toggle). `DialogueSubjectRow` handles read/inline-edit/delete for each subject. `AddDialogueSubjectRow` provides inline creation. The create hook uses `scriptDialogueUuid` (not `dialogueUuid`).

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
