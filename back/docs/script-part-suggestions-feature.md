# Script Part Suggestions — Backend Documentation

## Overview

Per-line AI suggestions on a script. The unified `ScriptPart` table replaces the 8 specialized part entities (Hook, Text, Dialogue, Shot, VoiceOver, CallToAction, RetentionCue, Chapter). Each row is a single user-controlled line. The chat AI proposes targeted operations (rewrite / insert / delete / reorder) on specific lines via a new `ScriptPartSuggestion` entity. Each suggestion can be accepted (mutates the line directly) or rejected.

This replaces the previous `ScriptVersion` (whole-draft accept/reject) + `ScriptGeneration` (AI batch history) machinery.

## Entities

### `ScriptPart`
Single unified table for all script lines.

| Field | Type | Notes |
|-------|------|-------|
| `uuid` | GUID | indexed |
| `content` | text | the line content |
| `position` | int | order within the script (0-indexed) |
| `type` | `ScriptPartType` enum | discriminator: `hook` / `text` / `dialogue` / `shot` / `voice_over` / `call_to_action` / `retention_cue` / `chapter` |
| `script` | FK Script | CASCADE delete |
| `user` | FK User | CASCADE delete |
| `createdAt` / `updatedAt` | datetime | |

Index on `(script_id, position)`.

### `ScriptPartSuggestion`
One row per AI-proposed operation.

| Field | Type | Notes |
|-------|------|-------|
| `uuid` | GUID | indexed |
| `chatMessage` | FK Message | CASCADE delete |
| `script` | FK Script | denormalized for indexed `(script_id, status)` queries |
| `scriptPart` | nullable FK ScriptPart | set for `Rewrite` / `Delete` / `Reorder`; null for `Insert` |
| `action` | `ScriptPartSuggestionAction` enum | `rewrite` / `insert` / `delete` / `reorder` |
| `originalContent` | nullable text | snapshot at creation time (Rewrite, Delete) |
| `proposedContent` | nullable text | new content (Rewrite, Insert) |
| `proposedType` | nullable `ScriptPartType` | new type (Insert) |
| `proposedPosition` | nullable int | target position (Insert, Reorder) |
| `status` | `ScriptPartSuggestionStatus` enum | `pending` / `accepted` / `rejected` (defaults to `pending`) |
| `user` | FK User | CASCADE delete |
| `createdAt` / `updatedAt` | datetime | |

Indexes on `(script_id, status)` and `message_id`.

## Endpoints

### Script parts (`ScriptPartController`, `ScriptController`)

- `GET /api/scripts/{scriptUuid}/parts` — list ordered parts (in `ScriptController::listParts`)
- `POST /api/scripts/{scriptUuid}/parts` — create a part. Body: `{ content, type, position? }`. Used by the editor's Enter-key handler.
- `PATCH /api/script-parts/{partUuid}` — update content / type / position.
- `DELETE /api/script-parts/{partUuid}`
- `PATCH /api/scripts/{scriptUuid}/reorder-parts` — bulk reorder (body keeps the existing `{ orderedParts: [{ uuid, type }] }` shape for backwards compatibility; only `uuid` is used).

### Script part suggestions (`ScriptPartSuggestionController`)

- `GET /api/scripts/{scriptUuid}/script-part-suggestions?status=pending` — list suggestions for a script (optionally filtered by status).
- `POST /api/script-part-suggestions/{suggestionUuid}/accept` — apply the operation, mark suggestion `Accepted`.
- `POST /api/script-part-suggestions/{suggestionUuid}/reject` — mark suggestion `Rejected` (no mutation on parts).

## Services

### `ScriptPartService` (`Service/ScriptPart/`)

Handles position shifting around create / update / delete:

- `create(script, user, content, type, position?)` — if `position` is null, appends to end; else shifts subsequent parts down by 1.
- `update(part, content?, type?, position?)` — content/type are direct sets; position triggers a `repositionWithinScript` that shifts the affected range.
- `delete(part)` — removes the row, then shifts subsequent parts up by 1.

### `ScriptPartSuggestionService` (`Service/ScriptPartSuggestion/`)

- `accept(suggestion)`:
  - `Rewrite` → updates `scriptPart.content` to `proposedContent`
  - `Insert` → creates a new `ScriptPart` at `proposedPosition` (delegates to `ScriptPartService::create`)
  - `Delete` → deletes `scriptPart` and **auto-rejects** other pending suggestions on the same part (they're now meaningless)
  - `Reorder` → updates `scriptPart.position` to `proposedPosition`
  - Sets status to `Accepted`.
- `reject(suggestion)` — sets status to `Rejected`. No mutation.

Both methods throw `ScriptPartSuggestionNotPendingException` (409) if the suggestion was already resolved.

## Chat AI integration

The chat now uses a single FreeChat-style flow with structured output. There are no more `ChatAction` branches.

### `ChatPromptAssemblerService` (`Service/PromptAssembler/`)

Builds a prompt that includes:
- system role (French, suggestion-operations explainer),
- creator profile,
- optional reference script (from `userMessage.metadata.referenceScriptUuid`),
- the **current script** as ordered parts with each part's `uuid`, `type`, `content`, and `position`,
- conversation history,
- the user's current message,
- the JSON output instruction.

The required output shape:

```json
{
  "replyText": "Conversational reply for the user (in French)",
  "suggestions": [
    { "action": "rewrite", "scriptPartUuid": "…", "proposedContent": "…" },
    { "action": "insert", "proposedPosition": 2, "proposedType": "text", "proposedContent": "…" },
    { "action": "delete", "scriptPartUuid": "…" },
    { "action": "reorder", "scriptPartUuid": "…", "proposedPosition": 0 }
  ]
}
```

`suggestions` may be empty (if the AI is asking a follow-up question or just chatting).

### `ChatResponseProcessorService` (`Service/ChatGeneration/`)

- Strips markdown code fences and parses JSON.
- Creates the AI `Message` with `replyText` as content (falls back to raw output if the JSON is malformed).
- For each suggestion:
  - validates the action,
  - for `Rewrite` / `Delete`: looks up the target part by `scriptPartUuid`, captures `originalContent` as a snapshot,
  - persists a `ScriptPartSuggestion`.
- Stores `{ suggestionUuids: [...] }` in `Message.metadata` so the frontend can render the in-chat card.

### Handler

`GenerateChatMessageResponseHandler` is unchanged in shape but no longer carries a `ChatAction` parameter (`GenerateChatMessageResponseMessage` was simplified). The handler debits credits, calls the AI, hands the output to `ChatResponseProcessorService`, and refunds on permanent failure (3 retries with exponential backoff).

## Migration

Two migrations:

1. **`Version20260425081400`** — creates `script_part` and `script_part_suggestion` tables, copies content from the 8 specialized tables (skipping rows tied to a `script_version_id`, which were drafts).
2. **`Version20260425083837`** — drops `script_hook`, `script_text`, `script_dialogue`, `script_shot`, `script_voice_over`, `script_call_to_action`, `script_retention_cue`, `script_chapter`, `script_version`, `script_generation`, and `dialogue_subject` after the new system is wired in.

## Exceptions

- `ScriptPartNotFoundException` (`DomainCode::ScriptPart` = 28, code 1, 404)
- `ScriptPartSuggestionNotFoundException` (`DomainCode::ScriptPartSuggestion` = 29, code 1, 404)
- `ScriptPartSuggestionNotPendingException` (`DomainCode::ScriptPartSuggestion` = 29, code 2, 409)
