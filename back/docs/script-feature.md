# Script Feature - Backend Documentation

## Overview

The Script feature allows users to create structured writing plans for social media content. A Script belongs to a Project and can optionally be linked to a PostGroup (1:1). Scripts contain reorderable **parts** -- 8 separate entity types (Chapter, VoiceOver, Dialogue, Shot, Text, CallToAction, RetentionCue, Hook) each in their own table, sharing a global `position` for cross-type ordering. Scripts also have **tags** that are project-scoped, linked via ManyToMany.

---

## Entities

### `Script` (`App\Entity\Script`)

**Location:** `back/src/Entity/Script.php`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `title` | `string (255)` | Script title |
| `publishedAt` | `DateTimeImmutable` | Optional planned publication date |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |
| `project` | `Project` | Parent project (ManyToOne inversedBy `scripts`, cascade delete) |
| `postGroup` | `PostGroup` | Optional linked post group (OneToOne, SET NULL on delete) |
| `tags` | `Collection<ScriptTag>` | Project-scoped tags (ManyToMany owning side) |
| `scriptChapters` | `Collection<ScriptChapter>` | Chapters (OneToMany, cascade remove, orphanRemoval) |
| `scriptVoiceOvers` | `Collection<ScriptVoiceOver>` | Voice-overs (OneToMany, cascade remove, orphanRemoval) |
| `scriptDialogues` | `Collection<ScriptDialogue>` | Dialogues (OneToMany, cascade remove, orphanRemoval) |
| `scriptShots` | `Collection<ScriptShot>` | Shots (OneToMany, cascade remove, orphanRemoval) |
| `scriptTexts` | `Collection<ScriptText>` | Texts (OneToMany, cascade remove, orphanRemoval) |
| `scriptCallToActions` | `Collection<ScriptCallToAction>` | Call-to-actions (OneToMany, cascade remove, orphanRemoval) |
| `scriptRetentionCues` | `Collection<ScriptRetentionCue>` | Retention cues (OneToMany, cascade remove, orphanRemoval) |
| `scriptHooks` | `Collection<ScriptHook>` | Hooks (OneToMany, cascade remove, orphanRemoval) |

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
| `tone` | `Tone` | Voice-over tone (calm, dynamic, dramatic, neutral, casual_friendly, etc.) |
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

### `ScriptCallToAction` (`App\Entity\ScriptCallToAction`)

**Location:** `back/src/Entity/ScriptCallToAction.php`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `content` | `string (TEXT)` | Call-to-action content |
| `callToActionType` | `CallToActionType` | Type of CTA (subscribe, like, comment, share, link, custom) |
| `position` | `int` | Global order across all part types |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `script` | `Script` | Parent script (ManyToOne, cascade delete) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |

**Virtual getter:** `getType(): string` returns `'call_to_action'`

### `ScriptRetentionCue` (`App\Entity\ScriptRetentionCue`)

**Location:** `back/src/Entity/ScriptRetentionCue.php`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `content` | `string (TEXT)` | Retention cue content |
| `retentionCueType` | `RetentionCueType` | Type of cue (question, teaser, pattern_break, cliffhanger) |
| `position` | `int` | Global order across all part types |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `script` | `Script` | Parent script (ManyToOne, cascade delete) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |

**Virtual getter:** `getType(): string` returns `'retention_cue'`

### `ScriptHook` (`App\Entity\ScriptHook`)

**Location:** `back/src/Entity/ScriptHook.php`

Script hook (opening line). Only one hook is allowed per script per generation compartment. Always positioned first (position 0). No subtypes — just content.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `content` | `string (TEXT)` | Hook content |
| `position` | `int` | Global order across all part types (always 0) |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
| `script` | `Script` | Parent script (ManyToOne, cascade delete) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |
| `scriptGeneration` | `ScriptGeneration` | Optional generation link (ManyToOne, nullable, cascade delete) |
| `hookTemplate` | `HookTemplate` | Optional hook template link (ManyToOne, nullable, SET NULL on delete) |

**Virtual getter:** `getType(): string` returns `'hook'`

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

### `HookTemplate` (`App\Entity\HookTemplate`)

**Location:** `back/src/Entity/HookTemplate.php`

Reusable hook templates with placeholder support. Templates can be public (shared) or private (user-scoped). Used by ScriptHook to pre-fill hook content from a template pattern.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `title` | `string (255)` | Template title |
| `content` | `string (TEXT)` | Template content (may contain placeholders like `{topic}`, `{audience}`, etc.) |
| `isPublic` | `bool` | Whether the template is publicly visible (default: false) |
| `createdAt` | `DateTimeImmutable` | Creation timestamp (UTC) |
| `updatedAt` | `DateTimeImmutable` | Last update timestamp (UTC, auto-updated) |
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
| `call_to_action` | Call-to-action part |
| `retention_cue` | Retention cue part |
| `hook` | Hook part |

### `CallToActionType` (`App\Entity\Enum\CallToActionType`)

| Value | Description |
|-------|-------------|
| `subscribe` | Subscribe CTA |
| `like` | Like CTA |
| `comment` | Comment CTA |
| `share` | Share CTA |
| `link` | Link CTA |
| `custom` | Custom CTA |

### `RetentionCueType` (`App\Entity\Enum\RetentionCueType`)

| Value | Description |
|-------|-------------|
| `question` | Question to the audience |
| `teaser` | Teaser for upcoming content |
| `pattern_break` | Pattern break to reset attention |
| `cliffhanger` | Cliffhanger moment |

### `ChapterType` (`App\Entity\Enum\ChapterType`)

| Value | Description |
|-------|-------------|
| `on_screen` | On-screen chapter |
| `off_screen` | Off-screen chapter |

### `Tone` (`App\Entity\Enum\Tone`)

Renamed from `VoiceOverType`. Also used by `CreatorProfile` (see [script-generation-feature.md](script-generation-feature.md)).

| Value | Description |
|-------|-------------|
| `calm` | Calm delivery |
| `dynamic` | Dynamic delivery |
| `dramatic` | Dramatic delivery |
| `neutral` | Neutral delivery |
| `casual_friendly` | Casual & friendly |
| `educational_authoritative` | Educational & authoritative |
| `hype_energetic` | Hype & energetic |
| `funny_sarcastic` | Funny & sarcastic |
| `storytelling_emotional` | Storytelling & emotional |

### `ShotType` (`App\Entity\Enum\ShotType`)

| Value | Description |
|-------|-------------|
| `a_roll` | A-roll (main footage) |
| `b_roll` | B-roll (supplementary footage) |

### `HookTemplatePlaceholder` (`App\Entity\Enum\HookTemplatePlaceholder`)

Used to list available placeholders that can be embedded in hook template content (e.g. `{topic}`, `{audience}`).

| Value | Description |
|-------|-------------|
| `topic` | Topic placeholder |
| `audience` | Audience placeholder |
| `benefit` | Benefit placeholder |
| `statistic` | Statistic placeholder |
| `problem` | Problem placeholder |
| `product` | Product placeholder |
| `result` | Result placeholder |
| `emotion` | Emotion placeholder |
| `number` | Number placeholder |
| `goal` | Goal placeholder |
| `date` | Date placeholder |

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
| `getByProjectAndUserPaginated` | `Project $project, User $user, int $page, int $limit, ?ScriptStatus $status = null` | `array` | Paginated scripts ordered by creation date DESC, optionally filtered by status |

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

### Part Repositories (ScriptChapter, ScriptVoiceOver, ScriptDialogue, ScriptShot, ScriptText, ScriptCallToAction, ScriptRetentionCue, ScriptHook)

All follow the same pattern:

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `save` | `$entity, bool $flush` | `void` | Persists entity |
| `remove` | `$entity, bool $flush` | `void` | Removes entity |
| `getByUuidAndUser` | `string $uuid, User $user` | `?Entity` | Find by UUID and user |
| `getByScriptAndUserOrderedByPosition` | `Script $script, User $user` | `array` | All parts for script ordered by position |
| `getMaxPositionByScript` | `Script $script` | `int` | Max position value (-1 if no results) |
| `getMaxPositionByScriptAndGeneration` | `Script $script, ?ScriptGeneration $generation` | `int` | Max position scoped by script and optional generation (-1 if no results) |
| `existsByScriptUserAndGeneration` | `Script $script, User $user, ?ScriptGeneration $generation` | `bool` | Checks if a hook already exists (ScriptHookRepository only) |

### `DialogueSubjectRepository`

**Location:** `back/src/Repository/DialogueSubjectRepository.php`

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `save` | `DialogueSubject $entity, bool $flush` | `void` | Persists entity |
| `remove` | `DialogueSubject $entity, bool $flush` | `void` | Removes entity |
| `getByUuidAndUser` | `string $uuid, User $user` | `?DialogueSubject` | Find by UUID and user |
| `getByScriptDialogueAndUserOrderedByPosition` | `ScriptDialogue $dialogue, User $user` | `array` | All subjects for dialogue ordered by position |
| `getMaxPositionByScriptDialogue` | `ScriptDialogue $dialogue` | `int` | Max position value (-1 if no results) |

### `HookTemplateRepository`

**Location:** `back/src/Repository/HookTemplateRepository.php`

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `save` | `HookTemplate $entity, bool $flush` | `void` | Persists a hook template |
| `remove` | `HookTemplate $entity, bool $flush` | `void` | Removes a hook template |
| `getByUuid` | `string $uuid` | `?HookTemplate` | Finds template by UUID (any user) |
| `getByUuidAndUser` | `string $uuid, User $user` | `?HookTemplate` | Finds template by UUID for a specific user |
| `getPublicOrByUser` | `User $user` | `array` | All public templates + user's own, ordered by creation date DESC |
| `getPublicOrByUserPaginated` | `User $user, int $page, int $limit` | `array` | Paginated public + user's templates ordered by creation date DESC |
| `searchByTitlePublicOrByUser` | `string $searchTerm, User $user` | `array` | Searches templates by title LIKE among public + user's own |
| `searchByTitlePublicOrByUserPaginated` | `string $searchTerm, User $user, int $page, int $limit` | `array` | Paginated search by title LIKE among public + user's own |

---

## Controllers

### `ScriptController` — Route: `/api/scripts`

**Location:** `back/src/Controller/ScriptController.php`

| Action | Method | Route | Name | Description |
|--------|--------|-------|------|-------------|
| list | GET | `` | `api_scripts_list` | List scripts for a project (projectUuid QP, optional status filter) |
| create | POST | `` | `api_scripts_create` | Create script with optional PostGroup link and tags |
| show | GET | `/{uuid}` | `api_scripts_show` | Get script details |
| update | PATCH | `/{uuid}` | `api_scripts_update` | Update script (supports PostGroup unlink via explicit null) |
| delete | DELETE | `/{uuid}` | `api_scripts_delete` | Delete script |
| listParts | GET | `/{uuid}/parts` | `api_scripts_parts_list` | Unified list of all parts sorted by position |
| reorderParts | PATCH | `/{uuid}/reorder-parts` | `api_scripts_parts_reorder` | Reorder parts across all 8 types |

**Special behaviors:**
- `listParts`: Fetches from all 8 part repos, merges into one array, sorts by `position`. Each entity has a virtual `getType()` getter serialized in the response.
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

### Part Controllers (ScriptChapter, ScriptVoiceOver, ScriptDialogue, ScriptShot, ScriptText, ScriptCallToAction, ScriptRetentionCue, ScriptHook)

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
- Call-to-actions: `/api/scripts/call-to-actions`
- Retention cues: `/api/scripts/retention-cues`
- Hooks: `/api/scripts/hooks`

**Hook special behavior:** The create endpoint enforces "only one hook per script per generation compartment" — returns 400 if one already exists. Position is always 0.

**Auto-position on create:** If no `position` is provided, computes `max()` across all 8 part repos (scoped by generation if `generationUuid` is provided) and assigns `max + 1`.

**Generation scoping on create:** All part creation endpoints accept an optional `generationUuid` parameter. When provided, the part is assigned to the specified `ScriptGeneration` via `setScriptGeneration()`, and max position calculation uses `getMaxPositionByScriptAndGeneration` to scope positions within that generation compartment.

### `DialogueSubjectController` — Route: `/api/scripts/dialogue-subjects`

**Location:** `back/src/Controller/DialogueSubjectController.php`

| Action | Method | Route | Name | Description |
|--------|--------|-------|------|-------------|
| list | GET | `` | `api_scripts_dialogue_subjects_list` | List subjects for a dialogue |
| create | POST | `` | `api_scripts_dialogue_subjects_create` | Create subject with auto-position |
| update | PATCH | `/{uuid}` | `api_scripts_dialogue_subjects_update` | Update subject |
| delete | DELETE | `/{uuid}` | `api_scripts_dialogue_subjects_delete` | Delete subject |
| reorder | PATCH | `/reorder` | `api_scripts_dialogue_subjects_reorder` | Reorder subjects within a dialogue |

### `HookTemplateController` — Route: `/api/hook-templates`

**Location:** `back/src/Controller/HookTemplateController.php`

| Action | Method | Route | Name | Description |
|--------|--------|-------|------|-------------|
| list | GET | `` | `api_hook_templates_list` | List hook templates (public + user's own, optional searchTerm QP, paginated) |
| placeholders | GET | `/placeholders` | `api_hook_templates_placeholders` | List available HookTemplatePlaceholder enum values |
| create | POST | `` | `api_hook_templates_create` | Create a hook template |
| update | PATCH | `/{hookTemplateUuid}` | `api_hook_templates_update` | Update a hook template (owner only) |
| delete | DELETE | `/{hookTemplateUuid}` | `api_hook_templates_delete` | Delete a hook template (owner only) |

**Special behaviors:**
- `list`: Returns templates that are either public (`isPublic = true`) or owned by the current user. Supports optional `searchTerm` query parameter for title LIKE search. Paginated via `page` and `limit` QPs.
- `update`/`delete`: Only the owner can update or delete a template (looked up via `getByUuidAndUser`).

**Hook template handling in ScriptHookController:**
- `create`: Accepts optional `hookTemplateUuid`. When provided, looks up the template via `getByUuid` (not user-scoped, since templates can be public) and links it to the new hook via `setHookTemplate()`.
- `update`: Uses the `hasHookTemplateUuid` pattern (same as `postGroupUuid` on Script). When `hookTemplateUuid` is explicitly present in the payload: if non-null, links the template; if `null`, unlinks it (`setHookTemplate(null)`).

---

## DTOs

### Query Param DTOs

| DTO | Properties | Validation |
|-----|------------|------------|
| `ListScriptsQueryParamDTO` | `projectUuid`, `page`, `limit`, `status?` (ScriptStatus) | NotBlank, Positive (status optional, parsed via `tryFrom`) |
| `ListScriptTagsQueryParamDTO` | `projectUuid`, `searchTerm?` | NotBlank on projectUuid |
| `ListScriptChaptersQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListScriptVoiceOversQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListScriptDialoguesQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListScriptShotsQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListScriptTextsQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListScriptCallToActionsQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListScriptRetentionCuesQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListScriptHooksQueryParamDTO` | `scriptUuid` | NotBlank |
| `ListDialogueSubjectsQueryParamDTO` | `scriptDialogueUuid` | NotBlank |
| `ListHookTemplatesQueryParamDTO` | `searchTerm?`, `page`, `limit` | NotBlank + Positive on page/limit |

### Request DTOs

| DTO | Properties |
|-----|------------|
| `CreateScriptRequestDTO` | `projectUuid`, `title`, `publishedAt?`, `postGroupUuid?`, `tagUuids?` |
| `UpdateScriptRequestDTO` | `title?`, `publishedAt?`, `postGroupUuid?` (nullable = unlink), `tagUuids?` |
| `ReorderScriptPartsRequestDTO` | `orderedParts: [{uuid, type}]` |
| `CreateScriptTagRequestDTO` | `projectUuid`, `title`, `color` (default: Green) |
| `UpdateScriptTagRequestDTO` | `title`, `color` |
| `CreateScriptChapterRequestDTO` | `scriptUuid`, `title`, `description?`, `chapterType` (default: OnScreen), `position?`, `generationUuid?` |
| `UpdateScriptChapterRequestDTO` | `title?`, `description?`, `chapterType?` |
| `CreateScriptVoiceOverRequestDTO` | `scriptUuid`, `content`, `tone` (default: Neutral), `position?`, `generationUuid?` |
| `UpdateScriptVoiceOverRequestDTO` | `content?`, `tone?` |
| `CreateScriptDialogueRequestDTO` | `scriptUuid`, `title`, `description?`, `position?`, `generationUuid?` |
| `UpdateScriptDialogueRequestDTO` | `title?`, `description?` |
| `CreateScriptShotRequestDTO` | `scriptUuid`, `content`, `shotType` (default: ARoll), `position?`, `generationUuid?` |
| `UpdateScriptShotRequestDTO` | `content?`, `shotType?` |
| `CreateScriptTextRequestDTO` | `scriptUuid`, `content`, `position?`, `generationUuid?` |
| `UpdateScriptTextRequestDTO` | `content?` |
| `CreateScriptCallToActionRequestDTO` | `scriptUuid`, `content`, `callToActionType` (default: Custom), `position?`, `generationUuid?` |
| `UpdateScriptCallToActionRequestDTO` | `content?`, `callToActionType?` |
| `CreateScriptRetentionCueRequestDTO` | `scriptUuid`, `content`, `retentionCueType` (default: Question), `position?`, `generationUuid?` |
| `UpdateScriptRetentionCueRequestDTO` | `content?`, `retentionCueType?` |
| `CreateScriptHookRequestDTO` | `scriptUuid`, `content`, `generationUuid?`, `hookTemplateUuid?` |
| `UpdateScriptHookRequestDTO` | `content?`, `hookTemplateUuid?` (nullable = unlink, tracked via `hasHookTemplateUuid()`) |
| `CreateDialogueSubjectRequestDTO` | `scriptDialogueUuid`, `speaker`, `content`, `position?` |
| `UpdateDialogueSubjectRequestDTO` | `speaker?`, `content?` |
| `ReorderDialogueSubjectsRequestDTO` | `scriptDialogueUuid`, `orderedUuids` |
| `CreateHookTemplateRequestDTO` | `title`, `content`, `isPublic` (default: false) |
| `UpdateHookTemplateRequestDTO` | `title?`, `content?`, `isPublic?` |

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
| `api_scripts_call_to_actions_list` | Call-to-action list endpoint |
| `api_scripts_call_to_actions_create` | Call-to-action create endpoint |
| `api_scripts_call_to_actions_update` | Call-to-action update endpoint |
| `api_scripts_retention_cues_list` | Retention cue list endpoint |
| `api_scripts_retention_cues_create` | Retention cue create endpoint |
| `api_scripts_retention_cues_update` | Retention cue update endpoint |
| `api_scripts_hooks_list` | Hook list endpoint |
| `api_scripts_hooks_create` | Hook create endpoint |
| `api_scripts_hooks_update` | Hook update endpoint |
| `api_scripts_dialogue_subjects_list` | Dialogue subject list endpoint |
| `api_scripts_dialogue_subjects_create` | Dialogue subject create endpoint |
| `api_scripts_dialogue_subjects_update` | Dialogue subject update endpoint |
| `api_hook_templates_list` | Hook template list endpoint |
| `api_hook_templates_create` | Hook template create endpoint |
| `api_hook_templates_update` | Hook template update endpoint |
| `api_hook_templates_show` | Hook template show endpoint |

---

## Relationships

```
User (1) ──────── (N) Script
User (1) ──────── (N) ScriptTag
Project (1) ───── (N) Script
Project (1) ───── (N) ScriptTag
PostGroup (1) ─── (0..1) Script        [OneToOne, nullable, SET NULL]
Script (N) ────── (N) ScriptTag        [ManyToMany, owning side on Script]
Script (1) ────── (N) ScriptChapter
Script (1) ────── (N) ScriptVoiceOver
Script (1) ────── (N) ScriptDialogue
Script (1) ────── (N) ScriptShot
Script (1) ────── (N) ScriptText
Script (1) ────── (N) ScriptCallToAction
Script (1) ────── (N) ScriptRetentionCue
Script (1) ────── (N) ScriptHook
ScriptGeneration (1) ── (N) ScriptChapter     [ManyToOne, nullable]
ScriptGeneration (1) ── (N) ScriptVoiceOver   [ManyToOne, nullable]
ScriptGeneration (1) ── (N) ScriptDialogue    [ManyToOne, nullable]
ScriptGeneration (1) ── (N) ScriptShot        [ManyToOne, nullable]
ScriptGeneration (1) ── (N) ScriptText        [ManyToOne, nullable]
ScriptGeneration (1) ── (N) ScriptCallToAction [ManyToOne, nullable]
ScriptGeneration (1) ── (N) ScriptRetentionCue [ManyToOne, nullable]
ScriptGeneration (1) ── (N) ScriptHook        [ManyToOne, nullable]
ScriptDialogue (1) ── (N) DialogueSubject
HookTemplate (1) ─── (N) ScriptHook       [ManyToOne, nullable, SET NULL]
User (1) ──────── (N) HookTemplate
```

---

## Global Position Ordering

Script parts (Chapter, VoiceOver, Dialogue, Shot, Text, CallToAction, RetentionCue, Hook) share a global `position` field for cross-type ordering within a script:

- **Auto-assignment on create:** If no `position` is provided, the controller computes `max()` across all 8 part repos (scoped by generation when `generationUuid` is provided) and assigns `max + 1`.
- **Generation scoping:** All part creation endpoints accept an optional `generationUuid`. When provided, the part is linked to the `ScriptGeneration` entity via `setScriptGeneration()`, and position auto-assignment uses `getMaxPositionByScriptAndGeneration()` to scope positions within that generation compartment. When `generationUuid` is not provided, `$generation` is `null` and positions are scoped to the script only.
- **Unified list:** `GET /api/scripts/{uuid}/parts` fetches from all 8 repos, merges, sorts by `position`, and serializes with each entity's virtual `getType()` getter.
- **Reorder:** `PATCH /api/scripts/{uuid}/reorder-parts` accepts `orderedParts: [{uuid, type}]`, dispatches to the correct repo via `ScriptPartType` enum, and sets `position = array index`.
