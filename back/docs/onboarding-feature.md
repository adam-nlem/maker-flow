# Onboarding Feature (Backend)

## Overview

The onboarding system tracks new user progress through a short, **role-aware** setup flow. The same `onboarding` row backs three distinct step lists — one per persona — so the service picks the applicable steps based on the user's role. New users receive 3 free credits at registration to enable AI features once they reach the agency shell.

## Entity: `Onboarding`

**File:** `src/Entity/Onboarding.php`

| Column | Type | Notes |
|--------|------|-------|
| id | int (auto) | Internal PK |
| uuid | GUID | Public ID |
| user_id | FK → user | Unique (one per user), CASCADE delete |
| completed_steps | JSON | String array of step values: `["create_agency", "create_first_project"]` |
| dismissed_at | datetime (nullable) | Set when user dismisses or all applicable steps are complete |
| created_at | datetime | UTC |
| updated_at | datetime | UTC, PreUpdate lifecycle |

`addCompletedStep(string)` / `isStepCompleted(string)` operate on raw step values — the entity is enum-agnostic.

**Serialization groups:** `api_onboarding_show`, `api_onboarding_complete_step`, `api_onboarding_dismiss`

## Role-aware step enums

The user's `displayRole` selects which enum applies:

| Role | Enum | File |
|------|------|------|
| `ROLE_ADMIN` (and default) | `AgencyAdminOnboardingStep` | `src/Entity/Enum/AgencyAdminOnboardingStep.php` |
| `ROLE_EDITOR`, `ROLE_VIEWER` | `AgencyCollaboratorOnboardingStep` | `src/Entity/Enum/AgencyCollaboratorOnboardingStep.php` |
| `ROLE_CLIENT` | `ClientOnboardingStep` | `src/Entity/Enum/ClientOnboardingStep.php` |

### `AgencyAdminOnboardingStep` (5 steps)

| Case | Value |
|------|-------|
| CreateAgency | `create_agency` |
| CreateFirstProject | `create_first_project` |
| InviteFirstClient | `invite_first_client` |
| ConnectFirstIntegration | `connect_first_integration` |
| ShowSubscriptions | `show_subscriptions` |

`InviteFirstCollaborator` is **not** part of onboarding — collaborator seat counts depend on the chosen subscription tier (last step), so the invite lives only in `/agency/settings/collaborators`.

### `AgencyCollaboratorOnboardingStep` (2 steps)

| Case | Value |
|------|-------|
| ExploreProjects | `explore_projects` |
| ExploreContents | `explore_contents` |

### `ClientOnboardingStep` (2 steps)

| Case | Value |
|------|-------|
| ConnectFirstIntegration | `connect_first_integration` |
| ExploreContents | `explore_contents` |

Step values that represent the same concept across roles (e.g., `connect_first_integration`, `explore_contents`) are intentionally shared so the storage stays flat.

## Service: `OnboardingService`

**File:** `src/Service/OnboardingService.php`

- `getOrCreateOnboarding(User)` — lazy-creates the row on first access.
- `getApplicableStepValues(User): string[]` — returns the step values of the enum matching the user's role.
- `completeStep(Onboarding, string $stepValue, User)` — validates `$stepValue` is in `getApplicableStepValues($user)` (else throws `InvalidOnboardingStepException`), appends it, and auto-dismisses when every applicable step is completed.
- `dismiss(Onboarding)` — manual dismiss; sets `dismissedAt`.

## Exception

`InvalidOnboardingStepException` (full code **32001**, HTTP 400) — thrown when the submitted step value is not applicable for the current user's role. Domain `Onboarding = 32` was added to `DomainCode`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/onboarding` | Returns onboarding state (auto-creates if not exists) |
| POST | `/api/onboarding/complete-step` | Body: `{"step": "<step_value>"}`; rejects cross-role values |
| POST | `/api/onboarding/dismiss` | Marks onboarding as complete |

## Welcome Credits

New users receive **3 free credits** at registration via `CreditService::addWelcomeCredits()`, called from `UserController::register()`. Uses `CreditTransactionType::WelcomeBonus` and `SourceBucket::RefillCredits`.

## Key Files

- `src/Entity/Onboarding.php`
- `src/Entity/Enum/AgencyAdminOnboardingStep.php`
- `src/Entity/Enum/AgencyCollaboratorOnboardingStep.php`
- `src/Entity/Enum/ClientOnboardingStep.php`
- `src/Repository/OnboardingRepository.php`
- `src/Service/OnboardingService.php`
- `src/Exception/Onboarding/OnboardingException.php`
- `src/Exception/Onboarding/InvalidOnboardingStepException.php`
- `src/Controller/OnboardingController.php`
- `src/DTO/Request/Onboarding/CompleteOnboardingStepRequestDTO.php`
- `src/Service/Credit/CreditService.php` (addWelcomeCredits)
