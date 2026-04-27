# Script Part Suggestions — Frontend Documentation

## Overview

Per-line AI suggestions on a script. The `ScriptPart` model is now a single unified class (replaces the previous discriminated union of 8 specialized models). The chat AI proposes targeted operations (rewrite / insert / delete / reorder) on specific lines via `ScriptPartSuggestion`. Each suggestion renders inline in the editor as a diff block AND inside the AI chat message as a card. Accept / reject buttons in either place hit the same backend endpoints.

## Models

### `ScriptPart` (`models/ScriptPart.ts`)
Unified class. Fields: `uuid`, `content`, `position`, `type` (`ScriptPartType`), `createdAt`, `updatedAt`. Replaces `ScriptHook`, `ScriptText`, `ScriptDialogue`, `ScriptShot`, `ScriptVoiceOver`, `ScriptCallToAction`, `ScriptRetentionCue`, `ScriptChapter`.

### `ScriptPartSuggestion` (`models/ScriptPartSuggestion.ts`)
Fields: `uuid`, `action`, `status`, `originalContent`, `proposedContent`, `proposedType`, `proposedPosition`, `scriptPartUuid` (target — nullable for inserts), `messageUuid` (which AI message produced it), timestamps. Has an `isPending` getter.

### Enums
- `ScriptPartSuggestionAction`: `Rewrite | Insert | Delete | Reorder`
- `ScriptPartSuggestionStatus`: `Pending | Accepted | Rejected`

## API hooks

### Script parts (`hooks/api/scripts/`)
- `useListScriptParts({ scriptUuid })` — `GET /scripts/{uuid}/parts`
- `useCreateScriptPart()` — `POST /scripts/{uuid}/parts`
- `useUpdateScriptPart()` — `PATCH /script-parts/{uuid}`
- `useDeleteScriptPart()` — `DELETE /script-parts/{uuid}`
- `useReorderScriptParts()` — `PATCH /scripts/{uuid}/reorder-parts` (existing, still used by drag-and-drop)

All mutations invalidate `scriptQueryKeys.parts(scriptUuid)`.

### Script part suggestions (`hooks/api/scriptPartSuggestions/`)
- `useListScriptPartSuggestions({ scriptUuid, status? })` — `GET /scripts/{uuid}/script-part-suggestions`
- `useAcceptScriptPartSuggestion()` — `POST /script-part-suggestions/{uuid}/accept`
- `useRejectScriptPartSuggestion()` — `POST /script-part-suggestions/{uuid}/reject`

Accept / reject mutations invalidate `scriptPartSuggestionQueryKeys.all`, `scriptQueryKeys.parts`, and (when `chatUuid` is provided) `chatMessageQueryKeys.list(chatUuid)`.

## Components

### Editor
- **`ScriptPartsList`** (`components/scripts/parts/`) — orchestrator. Owns the `DndContext` + `DragOverlay`, builds the suggestion lookup maps via `useGroupedScriptPartSuggestions`, mirrors the parts prop into local state via `useSyncedLocalParts` (paused while a drag is in flight), and renders the rows. For each part, looks up pending Rewrite / Delete / Reorder suggestions targeting it and renders `ScriptPartDiffBlock` inline. Insert suggestions are rendered between parts at their `proposedPosition`. Has an "Ajouter une partie" button at the bottom (creates a `Text`-typed part).
- **`ScriptPartRow`** — single row, *and* the draggable + droppable target (uses `useDraggable` + `useDroppable` directly, mirroring the `TodoListTaskCard` pattern). Accepts an `isDragDisabled` prop so the same component can be reused inside `DragOverlay`. Wraps `ScriptPartCard` and an inline TextArea bound to `part.content`. Saves on blur via `useUpdateScriptPart`. **Enter key** (no shift) calls `useCreateScriptPart` with `position = part.position + 1`, splitting into a new line.
- **`ScriptPartDiffBlock`** — inline diff with header (`Réécriture / Insertion / Suppression / Repositionnement suggérée`), Accept/Reject buttons, and body that varies per action: red strike-through original + green replacement for `Rewrite`; strike-through only for `Delete`; green replacement for `Insert`; "Déplacer à la position X" for `Reorder`.
- **`InteractiveAwarePointerSensor`** — custom dnd-kit `PointerSensor` that ignores pointer-down events originating from inputs / textareas / buttons / contenteditable, so users can click and type inside a draggable card without accidentally starting a drag.

### Chat
- **`ChatPanel`** — single send path that always uses FreeChat (no more `ChatAction` switch). No more `useApplyHookSuggestion` or `handleHookSuggestionClick`.
- **`ChatMessageBubble`** — renders the message text. If the AI message has `metadata.suggestionUuids`, renders `ChatSuggestionsCard` underneath.
- **`ChatSuggestionsCard`** — fetches all pending suggestions for the script and filters by `suggestionUuids`, then renders a `ScriptPartDiffBlock` for each. Accept/reject from here is identical to in-editor.
- **`ChatStartPlaceholder`** — three free-text starter prompts (no more `ChatAction` enum chips).

### Editor panel
- **`ScriptEditorPanel`** — simplified. No more `GenerationHistoryBar`, `GenerationStatusBanner`, `VersionPreviewBanner`, `focusedVersionUuid` / `focusedGenerationUuid` wiring.

## Stores

### `chatStore` (`stores/scripts/chatStore.ts`)
- `activeChatUuid`, `isWaitingForAi`, `isCreatingChat`. `focusedVersionUuid` and the version-preview side effect have been removed.

## Removed

Obsolete files deleted as part of this work:
- 8 specialized models (ScriptHook, ScriptText, ScriptDialogue, ScriptShot, ScriptVoiceOver, ScriptCallToAction, ScriptRetentionCue, ScriptChapter)
- `ScriptVersion`, `ScriptGeneration` models + enums + hooks
- 8 per-type card components + AddScriptPartMenu, ScriptPartTypeMenu, DialogueSubjectRow, AddDialogueSubjectRow, HookContentRenderer
- `generation/` directory (GenerationHistoryBar, GenerationStatusBanner, GenerateScriptPanel)
- `VersionPreviewBanner`, `ScriptVersionBadge`, `SuggestionChips`
- `useGenerateScriptFlow`, `useApplyHookSuggestion`
- `scriptGenerationStore`
- `ChatAction`, `GenerateScriptPhase`, `ScriptVersionStatus` enums

The 8 specialized-part hook directories (`scriptHooks/`, `scriptTexts/`, etc.) are also gone.
