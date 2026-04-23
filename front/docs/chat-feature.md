# Chat Feature — Frontend Documentation

## Overview

The chat feature provides a conversational AI interface for script generation and refinement. It replaces the form-based GenerateScriptPanel with a chat-based right panel where users can create scripts, analyze existing ones, improve hooks, or have free-form conversations with AI.

## Architecture

### Right Panel Integration

The ChatPanel renders as a collapsible right `SidePanel` (w-120) in the script page, alongside the existing GenerateScriptPanel and HookTemplatePanel. Panels are mutually exclusive — opening one closes others — managed by `useScriptRightPanelStore` with `ScriptRightPanel.Chat`.

**Trigger:** `ChatBubbleLeftRightIcon` button in `ScriptMetaHeader`, next to the existing SparklesIcon for generation.

### Component Tree

```
ChatPanel (SidePanel wrapper)
├── ChatHistoryBar (toolbar — horizontal chat pills + "Nouveau chat")
├── ChatMessageList (scrollable body)
│   ├── ChatStartPlaceholder (empty/new chat state with action suggestions)
│   ├── ChatMessageBubble (per message, renders by type)
│   │   ├── User messages: right-aligned, bg-primary/10
│   │   ├── AI messages: left-aligned, bg-light-gray
│   │   │   ├── SuggestionChips (when suggestedAnswers present)
│   │   │   └── ScriptVersionBadge (when metadata.scriptVersionUuid present)
│   │   └── System messages: centered, text-gray
│   └── AiTypingIndicator (pulsing dots while waiting)
└── ChatInput (footer — textarea + send button)
```

### Predefined Flow Step Components (under `chat/steps/`)

Self-contained UI components for the guided script creation flow (wired in Phase 5):
- `TargetAudienceStep` — list existing audiences + create new
- `GoalPillStep` — ScriptGoal enum pills
- `DurationPillStep` — VideoDuration enum pills
- `ReferenceScriptStep` — script picker with skip option
- `KeyPointsStep` — free text textarea with skip option

## Models

| Model | File | Fields |
|-------|------|--------|
| `Chat` | `models/Chat.ts` | `uuid`, `title` (nullable), `aiModel`, `createdAt`, `updatedAt` |
| `ChatMessage` | `models/ChatMessage.ts` | `uuid`, `content`, `type`, `suggestedAnswers[]`, `metadata`, `createdAt`, `updatedAt` |
| `ScriptVersion` | `models/ScriptVersion.ts` | `uuid`, `status`, `createdAt`, `updatedAt` |
| `TargetAudience` | `models/TargetAudience.ts` | `uuid`, `name`, `createdAt`, `updatedAt` |

## Enums

| Enum | File | Values |
|------|------|--------|
| `MessageType` | `enums/MessageType.ts` | `System`, `User`, `Ai` |
| `ChatAction` | `enums/ChatAction.ts` | `GenerateScript`, `AnalyzeScript`, `ImproveHook`, `FreeChat` |
| `ScriptVersionStatus` | `enums/ScriptVersionStatus.ts` | `Draft`, `Accepted`, `Rejected` |
| `PredefinedFlowStep` | `enums/PredefinedFlowStep.ts` | `TargetAudience`, `Goal`, `Duration`, `ReferenceScript`, `KeyPoints` |

## API Hooks

### Chat Hooks (`hooks/api/chats/`)
- `useListPaginatedChats({ scriptUuid })` — infinite scroll list of chats
- `useCreateChat()` — create chat with `{ scriptUuid, aiModel }`
- `useUpdateChat()` — update chat title
- `useDeleteChat()` — delete chat

### ChatMessage Hooks (`hooks/api/chatMessages/`)
- `useListChatMessages({ chatUuid })` — load all messages (limit=200, ASC order)
- `useCreateChatMessage()` — send message with optional `chatAction` and `metadata`

### ScriptVersion Hooks (`hooks/api/scriptVersions/`)
- `useShowScriptVersion({ versionUuid })` — fetch version details
- `useUpdateScriptVersion()` — accept or reject a draft version
- `useApplyHookSuggestion()` — apply a selected hook suggestion

### TargetAudience Hooks (`hooks/api/targetAudiences/`)
- `useListTargetAudiences({ projectUuid })` — list all audiences for project
- `useCreateTargetAudience()` — create new audience
- `useDeleteTargetAudience()` — delete audience

## Zustand Store

### `useChatStore` (`stores/scripts/chatStore.ts`)

| State | Type | Description |
|-------|------|-------------|
| `activeChatUuid` | `string \| null` | Currently selected chat |
| `isWaitingForAi` | `boolean` | Shows typing indicator |
| `isCreatingChat` | `boolean` | Model selection mode in ChatHistoryBar |

Resettable + persisted (`app:scripts:chat`).

## Chat Actions & AI Response Types

| ChatAction | AI Output | Frontend Handling |
|------------|-----------|-------------------|
| `GenerateScript` | ScriptVersion (draft) + summary message | ScriptVersionBadge with accept/reject |
| `ImproveHook` | Message with `suggestedAnswers[]` | SuggestionChips for hook selection |
| `AnalyzeScript` | Plain text message | Displayed as AI message |
| `FreeChat` | AI decides (text or version) | Automatic based on response |

## New Chat Flow

1. User clicks "Nouveau chat" in ChatHistoryBar
2. AI model pills appear (Gemini, ChatGPT, Claude)
3. User selects model → chat created via API → `activeChatUuid` set
4. ChatStartPlaceholder shown with action suggestions
5. User types message or clicks suggestion → sent via `useCreateChatMessage`
6. `isWaitingForAi = true` → AiTypingIndicator shown
7. AI response arrives (Phase 5 polling) → message displayed

## Files Created

### Enums (4 new + 1 updated)
- `front/src/models/enums/MessageType.ts`
- `front/src/models/enums/ChatAction.ts`
- `front/src/models/enums/ScriptVersionStatus.ts`
- `front/src/models/enums/PredefinedFlowStep.ts`
- `front/src/models/enums/ScriptRightPanel.ts` (updated)

### Models (4)
- `front/src/models/Chat.ts`
- `front/src/models/ChatMessage.ts`
- `front/src/models/ScriptVersion.ts`
- `front/src/models/TargetAudience.ts`

### Query Keys (4)
- `front/src/hooks/api/chats/chatQueryKeys.ts`
- `front/src/hooks/api/chatMessages/chatMessageQueryKeys.ts`
- `front/src/hooks/api/scriptVersions/scriptVersionQueryKeys.ts`
- `front/src/hooks/api/targetAudiences/targetAudienceQueryKeys.ts`

### API Hooks (13)
- `front/src/hooks/api/chats/useListPaginatedChats.ts`
- `front/src/hooks/api/chats/useCreateChat.ts`
- `front/src/hooks/api/chats/useUpdateChat.ts`
- `front/src/hooks/api/chats/useDeleteChat.ts`
- `front/src/hooks/api/chatMessages/useListChatMessages.ts`
- `front/src/hooks/api/chatMessages/useCreateChatMessage.ts`
- `front/src/hooks/api/scriptVersions/useShowScriptVersion.ts`
- `front/src/hooks/api/scriptVersions/useUpdateScriptVersion.ts`
- `front/src/hooks/api/scriptVersions/useApplyHookSuggestion.ts`
- `front/src/hooks/api/targetAudiences/useListTargetAudiences.ts`
- `front/src/hooks/api/targetAudiences/useCreateTargetAudience.ts`
- `front/src/hooks/api/targetAudiences/useDeleteTargetAudience.ts`

### Store (1)
- `front/src/stores/scripts/chatStore.ts`

### Components (9 + 5 steps)
- `front/src/components/scripts/chat/ChatPanel.tsx`
- `front/src/components/scripts/chat/ChatHistoryBar.tsx`
- `front/src/components/scripts/chat/ChatMessageList.tsx`
- `front/src/components/scripts/chat/ChatMessageBubble.tsx`
- `front/src/components/scripts/chat/ChatStartPlaceholder.tsx` (renamed from WelcomeMessage)
- `front/src/components/scripts/chat/SuggestionChips.tsx`
- `front/src/components/scripts/chat/ScriptVersionBadge.tsx`
- `front/src/components/scripts/chat/AiTypingIndicator.tsx`
- `front/src/components/scripts/chat/ChatInput.tsx`
- `front/src/components/scripts/chat/steps/TargetAudienceStep.tsx`
- `front/src/components/scripts/chat/steps/GoalPillStep.tsx`
- `front/src/components/scripts/chat/steps/DurationPillStep.tsx`
- `front/src/components/scripts/chat/steps/ReferenceScriptStep.tsx`
- `front/src/components/scripts/chat/steps/KeyPointsStep.tsx`

### Updated Files (3)
- `front/src/components/scripts/ScriptPageView.tsx` — added ChatPanel
- `front/src/components/scripts/ScriptMetaHeader.tsx` — added Chat trigger button
- `front/src/models/enums/ScriptRightPanel.ts` — added `Chat` value

## Phase 5 (Next Steps)

- Predefined flow state machine in `chatStore` (orchestrates step components)
- Polling for AI responses (`refetchInterval` on messages query)
- Script version preview in editor + accept/reject UI
- Chat history navigation
- Wire predefined flow into ChatPanel
