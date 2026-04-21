# Chat Feature (Backend)

## Overview

The chat system replaces the form-based script generation with a conversational interface. Users interact with an AI assistant through guided questions and free-text messages to create, analyze, and refine scripts.

This document covers the Phase 2 backend API: CRUD endpoints for Target Audiences, Chats, Messages, and Script Versions. AI integration (Phase 3) builds on top of these endpoints.

---

## Entities

### Chat

Per-script conversation container. AI model is locked at creation time.

| Field | Type | Notes |
|-------|------|-------|
| uuid | GUID | Public identifier |
| title | string(255), nullable | Auto-generated, user-editable |
| aiModel | AiModel enum | Locked per chat (gemini, chatgpt, claude) |
| createdAt | DateTimeImmutable | UTC |
| updatedAt | DateTimeImmutable | UTC, auto-updated |

**Relationships:** User (ManyToOne), Script (ManyToOne), Messages (OneToMany), ScriptVersions (OneToMany)

### Message

Individual chat message. Supports system, user, and AI message types.

| Field | Type | Notes |
|-------|------|-------|
| uuid | GUID | Public identifier |
| content | TEXT | Message text |
| type | MessageType enum | system, user, ai |
| suggestedAnswers | JSON, nullable | Array of suggested responses |
| metadata | JSON, nullable | Structured data (step identifier, etc.) |
| createdAt | DateTimeImmutable | UTC |
| updatedAt | DateTimeImmutable | UTC, auto-updated |

**Relationships:** User (ManyToOne, nullable for system/AI), Chat (ManyToOne), parentMessage (ManyToOne self-ref, nullable)

### ScriptVersion

AI-generated script version linked to a chat message.

| Field | Type | Notes |
|-------|------|-------|
| uuid | GUID | Public identifier |
| status | ScriptVersionStatus enum | draft, accepted, rejected |
| createdAt | DateTimeImmutable | UTC |
| updatedAt | DateTimeImmutable | UTC, auto-updated |

**Relationships:** Script (ManyToOne), Chat (ManyToOne), Message (ManyToOne), User (ManyToOne)

**Status transitions:** Only `Draft -> Accepted` and `Draft -> Rejected` are allowed. Attempting to update a non-draft version returns HTTP 409.

### TargetAudience

Reusable audience profiles linked to a CreatorProfile.

| Field | Type | Notes |
|-------|------|-------|
| uuid | GUID | Public identifier |
| name | string(255) | Audience label |
| createdAt | DateTimeImmutable | UTC |
| updatedAt | DateTimeImmutable | UTC, auto-updated |

**Relationships:** CreatorProfile (ManyToOne), User (ManyToOne)
**Constraints:** Unique on (name, creator_profile_id)

---

## Enums

| Enum | Values | Location |
|------|--------|----------|
| MessageType | system, user, ai | `Entity/Enum/MessageType.php` |
| ScriptVersionStatus | draft, accepted, rejected | `Entity/Enum/ScriptVersionStatus.php` |

---

## API Endpoints

### Target Audiences

| Action | Method | Route | Name |
|--------|--------|-------|------|
| Create | POST | `/api/target-audiences` | `api_target_audiences_create` |
| List | GET | `/api/target-audiences?projectUuid=` | `api_target_audiences_list` |
| Delete | DELETE | `/api/target-audiences/{targetAudienceUuid}` | `api_target_audiences_delete` |

**Create request body:**
```json
{
  "projectUuid": "uuid",
  "name": "Jeunes entrepreneurs 25-35 ans"
}
```

**Note:** If no CreatorProfile exists for the project+user, one is auto-created.

### Chats

| Action | Method | Route | Name |
|--------|--------|-------|------|
| Create | POST | `/api/chats` | `api_chats_create` |
| List | GET | `/api/chats?scriptUuid=&page=&limit=` | `api_chats_list` |
| Show | GET | `/api/chats/{chatUuid}` | `api_chats_show` |
| Update | PATCH | `/api/chats/{chatUuid}` | `api_chats_update` |
| Delete | DELETE | `/api/chats/{chatUuid}` | `api_chats_delete` |

**Create request body:**
```json
{
  "scriptUuid": "uuid",
  "aiModel": "gemini"
}
```

**Update request body:**
```json
{
  "title": "New chat title"
}
```

### Chat Messages

| Action | Method | Route | Name |
|--------|--------|-------|------|
| Create | POST | `/api/chat-messages` | `api_messages_create` |
| List | GET | `/api/chat-messages?chatUuid=&page=&limit=` | `api_messages_list` |

**Create request body:**
```json
{
  "chatUuid": "uuid",
  "content": "message text",
  "parentMessageUuid": null,
  "metadata": null
}
```

**Note:** Messages are listed in chronological order (ASC) for chat display. Phase 2 only persists user messages — AI dispatch is added in Phase 3.

### Script Versions

| Action | Method | Route | Name |
|--------|--------|-------|------|
| List | GET | `/api/script-versions?scriptUuid=&page=&limit=` | `api_script_versions_list` |
| Show | GET | `/api/script-versions/{versionUuid}` | `api_script_versions_show` |
| Update | PATCH | `/api/script-versions/{versionUuid}` | `api_script_versions_update` |

**Update request body:**
```json
{
  "status": "accepted"
}
```

Allowed values: `accepted`, `rejected`. Only draft versions can be updated (returns 409 otherwise).

---

## Exception Hierarchy

| Domain Code | Domain | Exceptions |
|-------------|--------|------------|
| 25 | Chat | ChatNotFoundException (25001, 404) |
| 26 | TargetAudience | TargetAudienceNotFoundException (26001, 404) |
| 27 | ScriptVersion | ScriptVersionNotFoundException (27001, 404), ScriptVersionNotDraftException (27002, 409) |

---

## DTOs

### Request DTOs

| DTO | Location |
|-----|----------|
| CreateTargetAudienceRequestDTO | `DTO/Request/TargetAudience/` |
| CreateChatRequestDTO | `DTO/Request/Chat/` |
| UpdateChatRequestDTO | `DTO/Request/Chat/` |
| CreateMessageRequestDTO | `DTO/Request/Message/` |
| UpdateScriptVersionRequestDTO | `DTO/Request/ScriptVersion/` |

### QueryParam DTOs

| DTO | Location |
|-----|----------|
| ListTargetAudiencesQueryParamDTO | `DTO/QueryParam/TargetAudience/` |
| ListChatsQueryParamDTO | `DTO/QueryParam/Chat/` |
| ListMessagesQueryParamDTO | `DTO/QueryParam/Message/` |
| ListScriptVersionsQueryParamDTO | `DTO/QueryParam/ScriptVersion/` |

---

## Repository Methods

### ChatRepository
- `getByScriptAndUserPaginated(Script, User, page, limit): array`
- `getByUuidAndUser(uuid, User): ?Chat`

### MessageRepository
- `getByChatPaginated(Chat, page, limit): array` (ordered ASC)
- `getByUuidAndChat(uuid, Chat): ?Message`

### ScriptVersionRepository
- `getByScriptAndUserPaginated(Script, User, page, limit): array`
- `getByUuidAndUser(uuid, User): ?ScriptVersion`

### TargetAudienceRepository
- `getByCreatorProfile(CreatorProfile): array`
- `getByUuidAndUser(uuid, User): ?TargetAudience`
