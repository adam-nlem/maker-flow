# Script Feature - Backend Documentation

## Overview

The Script feature allows users to create structured writing plans for social media content. A Script belongs to a Project and can optionally be linked to a PostGroup (1:1). Scripts contain reorderable **parts** — 5 separate entity types (Chapter, VoiceOver, Dialogue, Shot, Text) each in their own table, sharing a global `position` for cross-type ordering. Scripts also have **tags** that are project-scoped, linked via ManyToMany.

---

## Entities

### `Script` (`App\Entity\Script`)

**Location:** `back/src/Entity/Script.php`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `title` | `string (255)` | Script title |
| `hook` | `string (TEXT)` | Optional hook/intro text |
| `publishedAt` | `DateTimeImmutable` | Optional planned publication date |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |
| `project` | `Project` | Parent project (ManyToOne inversedBy `scripts`, cascade delete) |
| `postGroup` | `PostGroup` | Optional linked post group (OneToOne, SET NULL on delete) |
| `hookTemplate` | `HookTemplate` | Optional source hook template (ManyToOne, SET NULL on delete) |
| `tags` | `Collection<ScriptTag>` | Project-scoped tags (ManyToMany owning side) |
| `scriptChapters` | `Collection<ScriptChapter>` | Chapters (OneToMany, cascade remove, orphanRemoval) |
| `scriptVoiceOvers` | `Collection<ScriptVoiceOver>` | Voice-overs (OneToMany, cascade remove, orphanRemoval) |
| `scriptDialogues` | `Collection<ScriptDialogue>` | Dialogues (OneToMany, cascade remove, orphanRemoval) |
| `scriptShots` | `Collection<ScriptShot>` | Shots (OneToMany, cascade remove, orphanRemoval) |
| `scriptTexts` | `Collection<ScriptText>` | Texts (OneToMany, cascade remove, orphanRemoval) |

### `ScriptTag` (`App\Entity\ScriptTag`)

**Location:** `back/src/Entity/ScriptTag.php`

Project-scoped tags. Scripts reference tags via ManyToMany.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `title` | `string (255)` | Tag name |
| `color` | `Color` | Tag color (Color enum) |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |
| `project` | `Project` | Parent project (ManyToOne inversedBy `scriptTags`, cascade delete) |
| `scripts` | `Collection<Script>` | Associated scripts (ManyToMany inverse side) |

**Constraints:** UniqueEntity on `[title, project, user]`

### `ScriptChapter` (`App\Entity\ScriptChapter`)

**Location:** `back/src/Entity/ScriptChapter.php`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `title` | `string (255)` | Chapter title |
| `description` | `string (TEXT)` | Optional chapter description |
| `chapterType` | `ChapterType` | On-screen or off-screen |
| `position` | `int` | Global order across all part types |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `script` | `Script` | Parent script (ManyToOne, cascade delete) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |

**Virtual getter:** `getType(): string` returns `'chapter'` (serialized in `api_scripts_parts_list`)

### `ScriptVoiceOver` (`App\Entity\ScriptVoiceOver`)

**Location:** `back/src/Entity/ScriptVoiceOver.php`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `content` | `string (TEXT)` | Voice-over content |
| `voiceOverType` | `VoiceOverType` | Calm, Dynamic, Dramatic, or Neutral |
| `position` | `int` | Global order across all part types |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `script` | `Script` | Parent script (ManyToOne, cascade delete) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |

**Virtual getter:** `getType(): string` returns `'voice_over'`

### `ScriptDialogue` (`App\Entity\ScriptDialogue`)

**Location:** `back/src/Entity/ScriptDialogue.php`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `title` | `string (255)` | Dialogue title |
| `description` | `string (TEXT)` | Optional dialogue description |
| `position` | `int` | Global order across all part types |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `script` | `Script` | Parent script (ManyToOne, cascade delete) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |
| `dialogueSubjects` | `Collection<DialogueSubject>` | Subjects (OneToMany, cascade remove, orphanRemoval) |

**Virtual getter:** `getType(): string` returns `'dialogue'`

### `ScriptShot` (`App\Entity\ScriptShot`)

**Location:** `back/src/Entity/ScriptShot.php`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `content` | `string (TEXT)` | Shot description |
| `shotType` | `ShotType` | A-roll or B-roll |
| `position` | `int` | Global order across all part types |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `script` | `Script` | Parent script (ManyToOne, cascade delete) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |

**Virtual getter:** `getType(): string` returns `'shot'`

### `ScriptText` (`App\Entity\ScriptText`)

**Location:** `back/src/Entity/ScriptText.php`

Free-form text block for notebook-style editing. No subtype — just content.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `content` | `string (TEXT)` | Text content |
| `position` | `int` | Global order across all part types |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `script` | `Script` | Parent script (ManyToOne, cascade delete) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |

**Virtual getter:** `getType(): string` returns `'text'`

### `DialogueSubject` (`App\Entity\DialogueSubject`)

**Location:** `back/src/Entity/DialogueSubject.php`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `speaker` | `string (255)` | Speaker name |
| `content` | `string (TEXT)` | Speaker's content/line |
| `position` | `int` | Order within the dialogue |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `scriptDialogue` | `ScriptDialogue` | Parent dialogue (ManyToOne, cascade delete) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |

---

## Enums

### `ScriptPartType` (`App\Entity\Enum\ScriptPartType`)

Used in reorder DTOs to identify part types. Not stored as a DB column.

| Value | Description |
|-------|-------------|
| `chapter` | Chapter part |
| `voice_over` | Voice-over part |
| `dialogue` | Dialogue part |
| `shot` | Shot part |
| `text` | Text part |

### `ChapterType` (`App\Entity\Enum\ChapterType`)

| Value | Description |
|-------|-------------|
| `on_screen` | On-screen chapter |
| `off_screen` | Off-screen chapter |

### `VoiceOverType` (`App\Entity\Enum\VoiceOverType`)

| Value | Description |
|-------|-------------|
| `calm` | Calm delivery |
| `dynamic` | Dynamic delivery |
| `dramatic` | Dramatic delivery |
| `neutral` | Neutral delivery |

### `ShotType` (`App\Entity\Enum\ShotType`)

| Value | Description |
|-------|-------------|
| `a_roll` | A-roll (main footage) |
| `b_roll` | B-roll (supplementary footage) |

---

## Repositories

### `ScriptRepository`

**Location:** `back/src/Repository/ScriptRepository.php`

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `save` | `Script $entity, bool $flush` | `void` | Persists a script |
| `remove` | `Script $entity, bool $flush` | `void` | Removes a script |
| `getByUuidAndUser` | `string $uuid, User $user` | `?Script` | Finds script by UUID for a specific user |
| `getByProjectAndUser` | `Project $project, User $user` | `array` | Returns all scripts for a project ordered by creation date DESC |
| `getByProjectAndUserPaginated` | `Project $project, User $user, int $page, int $limit` | `array` | Paginated scripts ordered by creation date DESC |

### `ScriptTagRepository`

**Location:** `back/src/Repository/ScriptTagRepository.php`

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `save` | `ScriptTag $entity, bool $flush` | `void` | Persists a tag |
| `remove` | `ScriptTag $entity, bool $flush` | `void` | Removes a tag |
| `getByUuidAndUser` | `string $uuid, User $user` | `?ScriptTag` | Finds tag by UUID for a specific user |
| `getByUserAndProjectLimited` | `User $user, Project $project, int $limit` | `array` | Lists tags ordered by creation date, limited |
| `getBySearchTermAndUserAndProjectLimited` | `string $searchTerm, User $user, Project $project, int $limit` | `array` | Searches tags by title LIKE |
| `getByTitleAndProjectAndUser` | `string $title, Project $project, User $user` | `?ScriptTag` | Finds tag by exact title (uniqueness check) |
| `getByUserAndWithUuidIn` | `User $user, array $uuids` | `array` | Batch fetch tags by UUIDs |

### Part Repositories (ScriptChapter, ScriptVoiceOver, ScriptDialogue, ScriptShot, ScriptText)

All follow the same pattern:

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `save` | `$entity, bool $flush` | `void` | Persists entity |
| `remove` | `$entity, bool $flush` | `void` | Removes entity |
| `getByUuidAndUser` | `string $uuid, User $user` | `?Entity` | Find by UUID and user |
| `getByScriptAndUserOrderedByPosition` | `Script $script, User $user` | `array` | All parts for script ordered by position |
| `getMaxPositionByScript` | `Script $script` | `int` | Max position value (-1 if no results) |

### `DialogueSubjectRepository`

**Location:** `back/src/Repository/DialogueSubjectRepository.php`

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `save` | `DialogueSubject $entity, bool $flush` | `void` | Persists entity |
| `remove` | `DialogueSubject $entity, bool $flush` | `void` | Removes entity |
| `getByUuidAndUser` | `string $uuid, User $user` | `?DialogueSubject` | Find by UUID and user |
| `getByScriptDialogueAndUserOrderedByPosition` | `ScriptDialogue $dialogue, User $user` | `array` | All subjects for dialogue ordered by position |
| `getMaxPositionByScriptDialogue` | `ScriptDialogue $dialogue` | `int` | Max position value (-1 if no results) |

---

## Controllers

### `ScriptController` — Route: `/api/scripts`

**Location:** `back/src/Controller/ScriptController.php`

| Action | Method | Route | Name | Description |
|--------|--------|-------|------|-------------|
| list | GET | `` | `api_scripts_list` | List scripts for a project (projectUuid QP) |
| create | POST | `` | `api_scripts_create` | Create script with optional PostGroup link and tags |
| show | GET | `/{uuid}` | `api_scripts_show` | Get script details |
| update | PATCH | `/{uuid}` | `api_scripts_update` | Update script (supports PostGroup unlink via explicit null) |
| delete | DELETE | `/{uuid}` | `api_scripts_delete` | Delete script |
| listParts | GET | `/{uuid}/parts` | `api_scripts_parts_list` | Unified list of all parts sorted by position |
| reorderParts | PATCH | `/{uuid}/reorder-parts` | `api_scripts_parts_reorder` | Reorder parts across all 4 types |

**Special behaviors:**
- `listParts`: Fetches from all 4 part repos, merges into one array, sorts by `position`. Each entity has a virtual `getType()` getter serialized in the response.
- `reorderParts`: Takes `orderedParts: [{uuid, type}]`, groups by `ScriptPartType` enum, batch-fetches from each repo, sets `position = index`.
- `update`: Supports explicit `null` for `postGroupUuid` to unlink a PostGroup (tracked via `hasPostGroupUuid()` in DTO).

### `ScriptTagController` — Route: `/api/scripts/tags`

**Location:** `back/src/Controller/ScriptTagController.php`

| Action | Method | Route | Name | Description |
|--------|--------|-------|------|-------------|
| list | GET | `` | `api_scripts_tags_list` | List tags for a project (projectUuid QP, optional searchTerm) |
| create | POST | `` | `api_scripts_tags_create` | Create project-scoped tag |
| update | PATCH | `/{tagUuid}` | `api_scripts_tags_update` | Update tag |
| delete | DELETE | `/{tagUuid}` | `api_scripts_tags_delete` | Delete tag |

### Part Controllers (ScriptChapter, ScriptVoiceOver, ScriptDialogue, ScriptShot, ScriptText)

All follow the same CRUD pattern:

| Action | Method | Route | Name Pattern |
|--------|--------|-------|-------------|
| list | GET | `` | `api_scripts_{type}_list` |
| create | POST | `` | `api_scripts_{type}_create` |
| update | PATCH | `/{uuid}` | `api_scripts_{type}_update` |
| delete | DELETE | `/{uuid}` | `api_scripts_{type}_delete` |

**Routes:**
- Chapters: `/api/scripts/chapters`
- Voice-overs: `/api/scripts/voice-overs`
- Dialogues: `/api/scripts/dialogues`
- Shots: `/api/scripts/shots`
- Texts: `/api/scripts/texts`

**Auto-position on create:** If no `position` is provided, computes `max()` across all 5 part repos and assigns `max + 1`.

### `DialogueSubjectController` — Route: `/api/scripts/dialogue-subjects`

**Location:** `back/src/Controller/DialogueSubjectController.php`

| Action | Method | Route | Name | Description |
|--------|--------|-------|------|-------------|
| list | GET | `` | `api_scripts_dialogue_subjects_list` | List subjects for a dialogue |
| create | POST | `` | `api_scripts_dialogue_subjects_create` | Create subject with auto-position |
| update | PATCH | `/{uuid}` | `api_scripts_dialogue_subjects_update` | Update subject |
| delete | DELETE | `/{uuid}` | `api_scripts_dialogue_subjects_delete` | Delete subject |
| reorder | PATCH | `/reorder` | `api_scripts_dialogue_subjects_reorder` | Reorder subjects within a dialogue |

---

## DTOs

### Query Param DTOs

| DTO | Properties | Validation |
|-----|------------|------------|
| `ListScriptsQueryParamDTO` | `projectUuid`, `page`, `limit` | NotBlank, Positive |
| `ListScriptTagsQueryParamDTO` | `projectUuid`, `searchTerm?` | NotBlank on projectUuid |
| `ListScriptChaptersQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListScriptVoiceOversQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListScriptDialoguesQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListScriptShotsQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListScriptTextsQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListDialogueSubjectsQueryParamDTO` | `scriptDialogueUuid` | NotBlank |

### Request DTOs

| DTO | Properties |
|-----|------------|
| `CreateScriptRequestDTO` | `projectUuid`, `title`, `hook?`, `publishedAt?`, `postGroupUuid?`, `hookTemplateUuid?`, `tagUuids?` |
| `UpdateScriptRequestDTO` | `title?`, `hook?`, `publishedAt?`, `postGroupUuid?` (nullable = unlink), `hookTemplateUuid?` (nullable = unlink), `tagUuids?` |
| `ReorderScriptPartsRequestDTO` | `orderedParts: [{uuid, type}]` |
| `CreateScriptTagRequestDTO` | `projectUuid`, `title`, `color` (default: Green) |
| `UpdateScriptTagRequestDTO` | `title`, `color` |
| `CreateScriptChapterRequestDTO` | `scriptUuid`, `title`, `description?`, `chapterType` (default: OnScreen), `position?` |
| `UpdateScriptChapterRequestDTO` | `title?`, `description?`, `chapterType?` |
| `CreateScriptVoiceOverRequestDTO` | `scriptUuid`, `content`, `voiceOverType` (default: Neutral), `position?` |
| `UpdateScriptVoiceOverRequestDTO` | `content?`, `voiceOverType?` |
| `CreateScriptDialogueRequestDTO` | `scriptUuid`, `title`, `description?`, `position?` |
| `UpdateScriptDialogueRequestDTO` | `title?`, `description?` |
| `CreateScriptShotRequestDTO` | `scriptUuid`, `content`, `shotType` (default: ARoll), `position?` |
| `UpdateScriptShotRequestDTO` | `content?`, `shotType?` |
| `CreateScriptTextRequestDTO` | `scriptUuid`, `content`, `position?` |
| `UpdateScriptTextRequestDTO` | `content?` |
| `CreateDialogueSubjectRequestDTO` | `scriptDialogueUuid`, `speaker`, `content`, `position?` |
| `UpdateDialogueSubjectRequestDTO` | `speaker?`, `content?` |
| `ReorderDialogueSubjectsRequestDTO` | `scriptDialogueUuid`, `orderedUuids` |

---

## Serialization Groups

| Group | Used In |
|-------|---------|
| `api_scripts_list` | Script list endpoint |
| `api_scripts_create` | Script create endpoint |
| `api_scripts_update` | Script update endpoint |
| `api_scripts_show` | Script show endpoint |
| `api_scripts_parts_list` | Unified parts list endpoint |
| `api_scripts_tags_list` | Tag list endpoint |
| `api_scripts_tags_create` | Tag create endpoint |
| `api_scripts_tags_update` | Tag update endpoint |
| `api_scripts_chapters_list` | Chapter list endpoint |
| `api_scripts_chapters_create` | Chapter create endpoint |
| `api_scripts_chapters_update` | Chapter update endpoint |
| `api_scripts_voice_overs_list` | Voice-over list endpoint |
| `api_scripts_voice_overs_create` | Voice-over create endpoint |
| `api_scripts_voice_overs_update` | Voice-over update endpoint |
| `api_scripts_dialogues_list` | Dialogue list endpoint |
| `api_scripts_dialogues_create` | Dialogue create endpoint |
| `api_scripts_dialogues_update` | Dialogue update endpoint |
| `api_scripts_shots_list` | Shot list endpoint |
| `api_scripts_shots_create` | Shot create endpoint |
| `api_scripts_shots_update` | Shot update endpoint |
| `api_scripts_texts_list` | Text list endpoint |
| `api_scripts_texts_create` | Text create endpoint |
| `api_scripts_texts_update` | Text update endpoint |
| `api_scripts_dialogue_subjects_list` | Dialogue subject list endpoint |
| `api_scripts_dialogue_subjects_create` | Dialogue subject create endpoint |
| `api_scripts_dialogue_subjects_update` | Dialogue subject update endpoint |

---

## Relationships

```
User (1) ──────── (N) Script
User (1) ──────── (N) ScriptTag
Project (1) ───── (N) Script
Project (1) ───── (N) ScriptTag
PostGroup (1) ─── (0..1) Script        [OneToOne, nullable, SET NULL]
HookTemplate (1) ── (N) Script        [ManyToOne, nullable, SET NULL]
Script (N) ────── (N) ScriptTag        [ManyToMany, owning side on Script]
Script (1) ────── (N) ScriptChapter
Script (1) ────── (N) ScriptVoiceOver
Script (1) ────── (N) ScriptDialogue
Script (1) ────── (N) ScriptShot
Script (1) ────── (N) ScriptText
ScriptDialogue (1) ── (N) DialogueSubject
```

---

## Global Position Ordering

Script parts (Chapter, VoiceOver, Dialogue, Shot, Text) share a global `position` field for cross-type ordering within a script:

- **Auto-assignment on create:** If no `position` is provided, the controller computes `max()` across all 5 part repos and assigns `max + 1`.
- **Unified list:** `GET /api/scripts/{uuid}/parts` fetches from all 5 repos, merges, sorts by `position`, and serializes with each entity's virtual `getType()` getter.
- **Reorder:** `PATCH /api/scripts/{uuid}/reorder-parts` accepts `orderedParts: [{uuid, type}]`, dispatches to the correct repo via `ScriptPartType` enum, and sets `position = array index`.
