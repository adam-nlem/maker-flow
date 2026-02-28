# Script Generation Feature — Backend Documentation

## Overview

The Script Generation feature allows users to generate script content using AI (Google Gemini). The system collects structured context via a **Creator Profile** (per project, persistent) and a **Script Brief** (per generation), assembles a prompt, and generates script content asynchronously via RabbitMQ.

**Generation compartments:** Each generation creates an isolated set of parts with independent positions (starting from 0). Parts are linked to their generation via a `scriptGeneration` ManyToOne on each part entity. Manually created parts (no generation) form their own compartment. The API supports filtering parts by generation.

---

## Entities

### `CreatorProfile` (`App\Entity\CreatorProfile`)

**Location:** `back/src/Entity/CreatorProfile.php`

Per-project persistent profile that captures the creator's style and preferences. One profile per project per user.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `platforms` | `JSON`, nullable | Array of platform strings (instagram, youtube, tiktok) |
| `contentType` | `ContentType` enum, nullable | short_form or long_form |
| `niche` | `text`, nullable | Free text describing the creator's niche |
| `targetAudience` | `text`, nullable | Free text describing the target audience |
| `tones` | `JSON`, nullable | Array of `Tone` enum values |
| `signaturePhrases` | `JSON`, nullable | Array of signature phrase strings |
| `neverList` | `JSON`, nullable | Array of words/phrases to avoid |
| `styleSample` | `text`, nullable | Sample of the creator's existing content |
| `user` | `User` | Owner (ManyToOne, cascade delete) |
| `project` | `Project` | Parent project (ManyToOne, cascade delete) |
| `createdAt` | `DateTimeImmutable` | Creation timestamp |
| `updatedAt` | `DateTimeImmutable`, nullable | Last update (auto via @PreUpdate) |

**Constraints:** UniqueConstraint on `[project_id, user_id]`

### `ScriptGeneration` (`App\Entity\ScriptGeneration`)

**Location:** `back/src/Entity/ScriptGeneration.php`

Tracks each async generation job and stores the input data (brief + skills) for traceability.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `uuid` | `string (GUID)` | Unique identifier exposed via API |
| `status` | `ScriptGenerationStatus` enum | pending → processing → completed/failed |
| `topic` | `string` | Brief: topic of the video |
| `goal` | `ScriptGoal` enum | Brief: goal of the script |
| `keyPoints` | `text`, nullable | Brief: key points to cover |
| `openingStyle` | `OpeningStyle` enum | Brief: style of the opening |
| `duration` | `VideoDuration` enum | Brief: target video duration |
| `callToAction` | `text`, nullable | Brief: desired call to action |
| `extraContext` | `text`, nullable | Brief: additional context for the AI |
| `activeSkills` | `JSON` | Array of active skill module keys |
| `skillInputs` | `JSON` | Extra inputs per skill (story, keyword, format, CTA type, retention cue type) |
| `assembledPrompt` | `text`, nullable | Full prompt sent to AI (for debugging, not serialized) |
| `errorMessage` | `text`, nullable | Error details if failed |
| `script` | `Script` | Target script (ManyToOne, cascade delete) |
| `user` | `User` | Owner (ManyToOne, cascade delete) |
| `createdAt` | `DateTimeImmutable` | Creation timestamp |
| `completedAt` | `DateTimeImmutable`, nullable | Completion timestamp |

---

## Enums

### `ContentType` (`App\Entity\Enum\ContentType`)

| Value | Description |
|-------|-------------|
| `short_form` | Short-form content (reels, shorts, TikTok) |
| `long_form` | Long-form content (YouTube videos) |

Added as a nullable field on the `Script` entity.

### `Tone` (`App\Entity\Enum\Tone`)

Renamed from `VoiceOverType`. Used in both `ScriptVoiceOver` (as `tone` field) and `CreatorProfile` (as JSON array).

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

### `ScriptGoal` (`App\Entity\Enum\ScriptGoal`)

| Value | Description |
|-------|-------------|
| `educate` | Educate the audience |
| `entertain` | Entertain |
| `inspire` | Inspire |
| `sell_promote` | Sell or promote |
| `grow_audience` | Grow audience |
| `start_conversation` | Start a conversation |

### `OpeningStyle` (`App\Entity\Enum\OpeningStyle`)

| Value | Description |
|-------|-------------|
| `bold_hook` | Bold hook opening |
| `shocking_stat` | Shocking statistic |
| `personal_story` | Personal story |
| `relatable_question` | Relatable question |
| `jump_into_content` | Jump straight into content |

### `VideoDuration` (`App\Entity\Enum\VideoDuration`)

| Value | Description |
|-------|-------------|
| `30_seconds` | 30 seconds |
| `1_minute` | 1 minute |
| `1_minute_30` | 1 minute 30 seconds |
| `2_minutes` | 2 minutes |
| `5_to_10_minutes` | 5 to 10 minutes |
| `10_to_20_minutes` | 10 to 20 minutes |
| `20_plus_minutes` | 20+ minutes |

### `SkillModule` (`App\Entity\Enum\SkillModule`)

| Value | Description |
|-------|-------------|
| `strong_hook` | Strong hook opening module |
| `retention_boosters` | Retention booster cues |
| `storytelling_mode` | Storytelling mode (requires story input) |
| `seo_optimization` | SEO optimization (requires keyword input) |
| `script_format` | Script format (requires format input) |
| `b_roll_cues` | B-Roll visual cues |
| `call_to_action` | Call-to-action integration |

### `ScriptFormat` (`App\Entity\Enum\ScriptFormat`)

Used in `skillInputs['format']` to control script output format.

| Value | Description |
|-------|-------------|
| `full_script` | Full script — every word as it would be spoken |
| `outline` | Detailed outline — talking points per section |
| `hybrid` | Hybrid — section headings with detailed talking points |

### `ScriptGenerationStatus` (`App\Entity\Enum\ScriptGenerationStatus`)

| Value | Description |
|-------|-------------|
| `pending` | Job dispatched, not yet picked up |
| `processing` | Worker is generating content |
| `completed` | Generation finished successfully |
| `failed` | Generation failed (error stored in errorMessage) |

---

## Repositories

### `CreatorProfileRepository`

**Location:** `back/src/Repository/CreatorProfileRepository.php`

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `save` | `CreatorProfile $entity, bool $flush` | `void` | Persists a profile |
| `remove` | `CreatorProfile $entity, bool $flush` | `void` | Removes a profile |
| `getByProjectAndUser` | `Project $project, User $user` | `?CreatorProfile` | Finds profile for project+user |

### `ScriptGenerationRepository`

**Location:** `back/src/Repository/ScriptGenerationRepository.php`

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `save` | `ScriptGeneration $entity, bool $flush` | `void` | Persists a generation |
| `getByUuidAndUser` | `string $uuid, User $user` | `?ScriptGeneration` | Finds generation by UUID |
| `getByScriptAndUser` | `Script $script, User $user` | `ScriptGeneration[]` | All generations for a script, ordered by createdAt DESC |

---

## Controllers

### `CreatorProfileController` — Route: `/api/creator-profiles`

**Location:** `back/src/Controller/CreatorProfileController.php`

| Action | Method | Route | QueryParamDTO | Description |
|--------|--------|-------|---------------|-------------|
| show | GET | `` | `ShowCreatorProfileQueryParamDTO` | Get profile for project. Returns 404 if none |
| createOrUpdate | POST | `` | — | Create or update profile (upsert pattern) |

### `ScriptGenerationController` — Route: `/api/script-generations`

**Location:** `back/src/Controller/ScriptGenerationController.php`

| Action | Method | Route | DTO | Description |
|--------|--------|-------|-----|-------------|
| create | POST | `` | `GenerateScriptRequestDTO` (build pattern) | Dispatch generation job. Returns ScriptGeneration with status `pending` |
| show | GET | `/{generationUuid}` | — | Get generation status (used for polling) |
| list | GET | `` | `LatestScriptGenerationQueryParamDTO` | Get all generations for a script (ordered by createdAt DESC) |

---

## DTOs

### `ShowCreatorProfileQueryParamDTO`

**Location:** `back/src/DTO/QueryParam/CreatorProfile/ShowCreatorProfileQueryParamDTO.php`

| Property | Type | Required |
|----------|------|----------|
| `projectUuid` | `string` | Yes (NotBlank) |

### `LatestScriptGenerationQueryParamDTO`

**Location:** `back/src/DTO/QueryParam/ScriptGeneration/LatestScriptGenerationQueryParamDTO.php`

| Property | Type | Required |
|----------|------|----------|
| `scriptUuid` | `string` | Yes (NotBlank) |

### `CreateOrUpdateCreatorProfileRequestDTO`

**Location:** `back/src/DTO/Request/CreatorProfile/CreateOrUpdateCreatorProfileRequestDTO.php`

| Property | Type | Required |
|----------|------|----------|
| `projectUuid` | `string` | Yes |
| `platforms` | `string[]` | No |
| `contentType` | `ContentType` | No |
| `niche` | `string` | No |
| `targetAudience` | `string` | No |
| `tones` | `Tone[]` | No |
| `signaturePhrases` | `string[]` | No |
| `neverList` | `string[]` | No |
| `styleSample` | `string` | No |

### `GenerateScriptRequestDTO`

**Location:** `back/src/DTO/Request/ScriptGeneration/GenerateScriptRequestDTO.php`

| Property | Type | Required |
|----------|------|----------|
| `scriptUuid` | `string` | Yes |
| `topic` | `string` | Yes |
| `goal` | `ScriptGoal` | Yes |
| `keyPoints` | `string` | No |
| `openingStyle` | `OpeningStyle` | Yes |
| `duration` | `VideoDuration` | Yes |
| `callToAction` | `string` | No |
| `extraContext` | `string` | No |
| `activeSkills` | `string[]` | Yes |
| `skillInputs` | `array` | Yes |

---

## Services

### `PromptAssemblerService`

**Location:** `back/src/Service/PromptAssemblerService.php`

Builds the full prompt by concatenating structured blocks:

1. Creator profile block — platform, content type, niche, audience, tones, signature phrases, never list
2. Style sample block — creator's style sample (if provided)
3. Script brief block — topic, goal, key points, opening style, duration, extra context
4. Skill modules block — active skill instructions (strong hook, retention boosters, storytelling, SEO, format, B-Roll, call to action) + negative instructions for disabled skills. When a specific CTA type or retention cue type is selected via `skillInputs`, the instruction targets that specific type; otherwise, generic instructions are used. When CTA type is "custom" and `callToAction` text is provided, the custom text is included in the CTA instruction
5. JSON formatting instructions — structured JSON schema with conditionally included part types based on active skills
6. Final instruction ("commence directement par le JSON")

### `GeminiClientService`

**Location:** `back/src/Service/GeminiClientService.php`

Calls the Google Gemini API (`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent`).

- Model: `gemini-3-pro-preview`
- Config: `GEMINI_API_KEY` env variable

### `ScriptOutputParserService`

**Location:** `back/src/Service/ScriptOutputParserService.php`

Parses the AI JSON response into typed script parts. The AI outputs a structured JSON object:

```json
{
  "title": "Script title",
  "hook": "Script hook",
  "parts": [
    { "type": "chapter", "title": "...", "description": "..." },
    { "type": "voice_over", "content": "..." },
    { "type": "shot", "content": "..." },
    { "type": "call_to_action", "content": "...", "callToActionType": "subscribe|like|comment|share|link|custom" },
    { "type": "retention_cue", "content": "...", "retentionCueType": "question|teaser|pattern_break|cliffhanger" },
    { "type": "text", "content": "..." }
  ]
}
```

| Part Type | Entity Created | Key Fields |
|-----------|---------------|------------|
| `chapter` | `ScriptChapter` | title, description, ChapterType::OffScreen |
| `voice_over` | `ScriptVoiceOver` | content, Tone::Neutral |
| `shot` | `ScriptShot` | content, ShotType::BRoll |
| `call_to_action` | `ScriptCallToAction` | content, CallToActionType from callToActionType field |
| `retention_cue` | `ScriptRetentionCue` | content, RetentionCueType from retentionCueType field |
| `text` | `ScriptText` | content |

Returns a `ScriptOutputDTO` containing extracted `?title`, `?hook`, and `ScriptOutputPartDTO[]`.

**DTOs:**
- `ScriptOutputDTO` (`back/src/DTO/ScriptOutputDTO.php`): Top-level parsed output with `title`, `hook`, and `parts` array. Static `fromArray()` factory.
- `ScriptOutputPartDTO` (`back/src/DTO/ScriptOutputPartDTO.php`): Individual parsed part with `type`, `title`, `description`, `content`, `callToActionType`, `retentionCueType`. Static `fromArray()` factory.

**Markdown code fence stripping:** The parser strips ```` ```json ``` ```` wrappers if the AI includes them.

Parts are created with incrementing positions starting from 0 within their generation compartment. Each generated part is linked to its `ScriptGeneration` entity.

---

## Async Flow

### `GenerateScriptMessage`

**Location:** `back/src/Message/GenerateScriptMessage.php`

Transport: `messages` (same RabbitMQ transport as other async tasks).

Contains: `scriptGenerationId` (int).

### `GenerateScriptHandler`

**Location:** `back/src/Message/Handler/GenerateScriptHandler.php`

Flow:
1. Load `ScriptGeneration` by ID → set status to `processing` → flush
2. Load `CreatorProfile` for the script's project + user (optional)
3. Call `PromptAssemblerService::assemble()` → store in `assembledPrompt` → flush
4. Call `GeminiClientService::generateScript()` → get AI response
5. Parse response via `ScriptOutputParserService::parseAndCreateParts()` → creates typed parts linked to the generation (positions start at 0)
6. Set status to `completed`, set `completedAt` → flush
7. **On error:** set status to `failed`, store `errorMessage` → flush

---

## Serialization Groups

| Group | Used In |
|-------|---------|
| `api_creator_profiles_show` | Creator profile show endpoint |
| `api_creator_profiles_create` | Creator profile create endpoint |
| `api_creator_profiles_update` | Creator profile update endpoint |
| `api_script_generations_show` | Script generation show endpoint |
| `api_script_generations_create` | Script generation create endpoint |

---

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | API key for Google Gemini |

### Services Configuration

In `config/services.yaml`:
- `app.gemini.api_key` parameter bound from `%env(GEMINI_API_KEY)%`
- `GeminiClientService` configured with the API key argument

---

## Relationships

```
User (1) ──────── (N) CreatorProfile
Project (1) ───── (N) CreatorProfile
Project + User ── (0..1) CreatorProfile    [Unique constraint]
User (1) ──────── (N) ScriptGeneration
Script (1) ────── (N) ScriptGeneration
ScriptGeneration (1) ── (N) ScriptParts (all 7 types: Text, Chapter, VoiceOver, Dialogue, Shot, CallToAction, RetentionCue)
```

### Part ↔ Generation Compartments

Each of the 7 script part entities has an optional `scriptGeneration` ManyToOne:

```php
#[ORM\ManyToOne(targetEntity: ScriptGeneration::class)]
#[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
private ?ScriptGeneration $scriptGeneration = null;
```

- `scriptGeneration = null` → manual part (created by user)
- `scriptGeneration = entity` → AI-generated part (created by generation)
- Positions are scoped per script + generation combination (each compartment starts at 0)
- Part repositories expose `getByScriptUserAndGenerationOrderedByPosition()` and `getMaxPositionByScriptAndGeneration()`
- `ScriptController::listParts()` accepts optional `generationUuid` query param to filter by compartment
- Part creation controllers accept optional `generationUuid` in their DTOs to assign new parts to a specific compartment
