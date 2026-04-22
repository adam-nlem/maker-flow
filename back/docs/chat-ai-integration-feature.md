# Chat AI Integration Feature

## Overview

The chat AI integration layer connects the chat system (Phase 1-2) to the AI client services (Gemini, OpenAI, Claude) for generating script content, analyzing scripts, and improving hooks through conversation.

## Architecture

### Diff-based ScriptVersion

ScriptVersions follow a git-style diff approach:
- A ScriptVersion is a "commit" containing only the parts that changed
- **Main parts** = parts where `scriptVersion IS NULL` (the current active script state)
- **Version parts** = parts linked to a specific ScriptVersion
- **Accept** = replace main parts of matching types with version parts
- **Reject** = version parts preserved as history, main parts untouched
- Phase 3 scope: only `ScriptHook` and `ScriptText` part types

### Flow

1. Frontend sends `POST /api/chat-messages/generate` with user message + action type
2. Controller validates, checks credits, saves user message, dispatches RabbitMQ job
3. Handler assembles prompt, calls AI, processes output based on action type
4. Result: AI message in chat + optional ScriptVersion (Draft) with parts

## Enums

### ChatAction (`Entity/Enum/ChatAction.php`)

| Case | Value | Description |
|------|-------|-------------|
| GenerateScript | `generate_script` | Full script generation from brief data |
| AnalyzeScript | `analyze_script` | Text analysis/feedback on current script |
| ImproveHook | `improve_hook` | Generate 3 alternative hook suggestions |
| FreeChat | `free_chat` | AI decides output type based on request |

### CreditTransactionType (extended)

| Case | Value | Description |
|------|-------|-------------|
| ChatGeneration | `chat_generation` | Debit when chat AI is triggered |
| ChatGenerationRefund | `chat_generation_refund` | Refund on permanent AI failure |

## API Endpoints

### POST /api/chat-messages/generate

Triggers AI generation. Creates a user message and dispatches an async job.

**Request:**
```json
{
    "chatUuid": "uuid",
    "content": "User message text",
    "chatAction": "generate_script|analyze_script|improve_hook|free_chat",
    "parentMessageUuid": "uuid (optional)",
    "metadata": {
        "audience": "string (optional, for generate_script)",
        "goal": "string (optional, for generate_script)",
        "duration": "string (optional, for generate_script)",
        "keyPoints": "string (optional, for generate_script)",
        "referenceScriptUuid": "uuid (optional)"
    }
}
```

**Response:** 201 Created — the user Message entity

**Credit:** 1 credit deducted. Returns 402 if insufficient.

### POST /api/script-versions/apply-hook-suggestion

Applies a selected hook suggestion as an auto-accepted ScriptVersion. No AI call, no credit cost.

**Request:**
```json
{
    "chatUuid": "uuid",
    "messageUuid": "uuid (the AI message with suggestions)",
    "hookContent": "The selected hook text"
}
```

**Response:** 201 Created — the ScriptVersion entity (status: accepted)

### PATCH /api/script-versions/{versionUuid}

Accept or reject a draft ScriptVersion.

**Request:**
```json
{
    "status": "accepted|rejected"
}
```

**Accept behavior:** For each part type in the version (hook, text), deletes existing main parts and promotes version parts to main.

**Reject behavior:** Version status set to rejected. Main parts untouched.

## Async Processing

### GenerateChatResponseMessage

RabbitMQ message dispatched when AI generation is triggered.

| Property | Type | Description |
|----------|------|-------------|
| messageId | int | User Message entity ID |
| chatAction | ChatAction | Action type |
| retryCount | int | Current retry attempt (0-based) |
| debitedFromSubscription | int | Credits debited from subscription bucket |
| debitedFromRefill | int | Credits debited from refill bucket |

### GenerateChatResponseHandler

Processes the message with the same retry strategy as `GenerateScriptHandler`:
- MAX_RETRIES: 3
- Exponential backoff: 2s → 4s → 8s
- Credits debited on first attempt only, carried through retries
- Refunded on permanent failure

**Output processing by ChatAction:**

| Action | AI Output | Result |
|--------|-----------|--------|
| GenerateScript | JSON parts | ScriptVersion (Draft) + AI summary message |
| ImproveHook | JSON suggestions | AI message with suggestedAnswers |
| AnalyzeScript | Plain text | AI text message |
| FreeChat | AI decides | JSON → ScriptVersion + message; Text → AI message |

## Services

### ChatPromptAssemblerService (`Service/PromptAssembler/`)

Builds context-aware prompts from:
1. System role (video script expert, responds in French)
2. Creator profile (niche, tones, signature phrases, never list)
3. Reference script content (if provided in metadata)
4. Current script content (for analyze/improve/free chat)
5. Brief data (for generate_script: audience, goal, duration, key points)
6. Conversation history (all previous messages)
7. Current user message
8. Output format instructions (JSON schema or free text, per action)

### CreatorProfilePromptHelper (`Service/PromptAssembler/`)

Static helper shared between `PromptAssemblerService` (old) and `ChatPromptAssemblerService` (new) for building the creator profile text block.

### ScriptVersionService (`Service/ScriptVersion/`)

Business logic for version lifecycle:
- `acceptVersion()`: Transaction — check which part types exist in version, delete matching main parts, promote version parts
- `rejectVersion()`: Set status to Rejected
- `applyHookSuggestion()`: Transaction — create auto-accepted ScriptVersion with single hook part, replace main hooks

## Repository Methods Added

### MessageRepository
- `getById(int $id): ?Message`
- `getAllByChat(Chat $chat): Message[]`

### ScriptHookRepository / ScriptTextRepository
- `getByScriptAndUserMainParts(Script, User): array` — main parts (scriptVersion IS NULL)
- `deleteMainPartsByScript(Script): void` — delete main parts
- `promoteVersionPartsToMain(ScriptVersion): void` — set scriptVersion = null
- `existsByScriptVersion(ScriptVersion): bool` — check if version has parts of this type
