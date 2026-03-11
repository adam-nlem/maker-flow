# Onboarding Feature (Backend)

## Overview

The onboarding system tracks new user progress through key app features. It stores completion state in a dedicated `onboarding` table, enabling cross-device persistence. Analytics are handled externally via PostHog.

## Entity: `Onboarding`

**File:** `src/Entity/Onboarding.php`

| Column | Type | Notes |
|--------|------|-------|
| id | int (auto) | Internal PK |
| uuid | GUID | Public ID |
| user_id | FK → user | Unique (one per user), CASCADE delete |
| completed_steps | JSON | Simple string array: `["create_first_project", "connect_integration"]` |
| dismissed_at | datetime (nullable) | Set when user dismisses or all steps complete |
| created_at | datetime | UTC |
| updated_at | datetime | UTC, PreUpdate lifecycle |

**Serialization groups:** `api_onboarding_show`, `api_onboarding_complete_step`, `api_onboarding_dismiss`

## Enum: `OnboardingStep`

**File:** `src/Entity/Enum/OnboardingStep.php`

| Case | Value |
|------|-------|
| CreateFirstProject | `create_first_project` |
| ConnectIntegration | `connect_integration` |
| CreateFirstScript | `create_first_script` |
| ShowSubscriptions | `show_subscriptions` |

To add a new step: add a case here and update the frontend `OnboardingStep` enum const maps.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/onboarding` | Returns onboarding state (auto-creates if not exists) |
| POST | `/api/onboarding/complete-step` | Body: `{"step": "create_first_project"}` |
| POST | `/api/onboarding/dismiss` | Marks onboarding as complete (called at end of onboarding flow) |

## Service: `OnboardingService`

**File:** `src/Service/OnboardingService.php`

- `getOrCreateOnboarding(User)` — Lazy-creates onboarding row on first access
- `completeStep(Onboarding, OnboardingStep)` — Adds step if not already completed. Auto-dismisses when all steps done.
- `dismiss(Onboarding)` — Sets `dismissedAt`

## Step Completion

All steps are completed by the frontend via `POST /api/onboarding/complete-step`. The `useOnboardingFlow` hook calls `advanceStep` → `completeStep` when the user advances through each onboarding step.

## Key Files

- `src/Entity/Onboarding.php`
- `src/Entity/Enum/OnboardingStep.php`
- `src/Repository/OnboardingRepository.php`
- `src/Service/OnboardingService.php`
- `src/Controller/OnboardingController.php`
- `src/DTO/Request/Onboarding/CompleteOnboardingStepRequestDTO.php`
