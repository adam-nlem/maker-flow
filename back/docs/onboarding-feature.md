# Onboarding Feature (Backend)

## Overview

The onboarding system tracks new user progress through a short **role-aware** setup flow. A **single unified enum** holds every step value; the service maps each role to the subset of steps it must complete. Roles with no applicable steps (Editor, Viewer) get their onboarding **auto-dismissed at creation** so they never enter the wizard.

New users receive 3 free credits at registration to unlock AI features once they reach the agency shell.

## Entity: `Onboarding`

**File:** `src/Entity/Onboarding.php`

| Column | Type | Notes |
|--------|------|-------|
| id | int (auto) | Internal PK |
| uuid | GUID | Public ID |
| user_id | FK → user | Unique (one per user), CASCADE delete |
| completed_steps | JSON | String array of step values: `["create_agency", "create_first_project"]` |
| dismissed_at | datetime (nullable) | Set when all applicable steps are complete, or at creation for roles without steps |
| created_at | datetime | UTC |
| updated_at | datetime | UTC, PreUpdate lifecycle |

`addCompletedStep(string)` / `isStepCompleted(string)` operate on raw step values — the entity is enum-agnostic.

**Serialization groups:** `api_onboarding_show`, `api_onboarding_complete_step`, `api_onboarding_dismiss`

## Unified enum: `OnboardingStep`

**File:** `src/Entity/Enum/OnboardingStep.php`

| Case | Value |
|------|-------|
| CreateAgency | `create_agency` |
| CreateFirstProject | `create_first_project` |
| InviteFirstClient | `invite_first_client` |
| ConnectFirstIntegration | `connect_first_integration` |
| ShowSubscriptions | `show_subscriptions` |
| ExploreContents | `explore_contents` |

`connect_first_integration` is shared by the Admin and Client flows — one value, two consumers.

## Role → step mapping

`OnboardingService::getApplicableStepValues(User): string[]`:

| Role | Applicable steps |
|------|------------------|
| `ROLE_ADMIN` | CreateAgency → CreateFirstProject → InviteFirstClient → ConnectFirstIntegration → ShowSubscriptions |
| `ROLE_CLIENT` | ConnectFirstIntegration → ExploreContents |
| `ROLE_EDITOR`, `ROLE_VIEWER`, default | *(empty — onboarding auto-dismissed at creation)* |

## Service: `OnboardingService`

**File:** `src/Service/OnboardingService.php`

- `getOrCreateOnboarding(User)` — lazy-creates the row on first access. If `getApplicableStepValues($user)` is empty, sets `dismissedAt` immediately so the user is never sent to `/onboarding`.
- `getApplicableStepValues(User): string[]` — returns the applicable step values for the user's role.
- `completeStep(Onboarding, string $stepValue, User)` — validates `$stepValue` is in `getApplicableStepValues($user)` (else throws `InvalidOnboardingStepException`), appends it, and auto-dismisses when every applicable step is completed.
- `dismiss(Onboarding)` — kept for a future "skip-all" CTA; not used by current flows.

## Exception

`InvalidOnboardingStepException` (HTTP 400) — thrown when the submitted step value is not applicable for the current user's role. Domain `Onboarding = 32` in `DomainCode`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/onboarding` | Returns onboarding state (auto-creates if not exists, auto-dismisses for roles with no steps) |
| POST | `/api/onboarding/complete-step` | Body: `{"step": "<step_value>"}`; rejects cross-role values |
| POST | `/api/onboarding/dismiss` | Dormant endpoint, reserved for a future "skip-all" CTA |

## Migration

`back/migrations/Version20260531000000.php` retroactively dismisses onboarding for any existing Editor/Viewer with `dismissed_at IS NULL`, in line with the new role mapping.

## Welcome Credits

New users receive **3 free credits** at registration via `CreditService::addWelcomeCredits()`, called from `UserController::register()`. Uses `CreditTransactionType::WelcomeBonus` and `SourceBucket::RefillCredits`.

## Key Files

- `src/Entity/Onboarding.php`
- `src/Entity/Enum/OnboardingStep.php`
- `src/Repository/OnboardingRepository.php`
- `src/Service/OnboardingService.php`
- `src/Exception/Onboarding/OnboardingException.php`
- `src/Exception/Onboarding/InvalidOnboardingStepException.php`
- `src/Controller/OnboardingController.php`
- `src/DTO/Request/Onboarding/CompleteOnboardingStepRequestDTO.php`
- `src/Service/Credit/CreditService.php` (addWelcomeCredits)
- `migrations/Version20260531000000.php` (auto-dismiss backfill for Editor/Viewer)
