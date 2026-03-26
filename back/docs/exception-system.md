# Exception System

Structured numeric exception system for consistent, machine-readable API error responses.

## Architecture

All business exceptions extend `AppException` (abstract). Domain exceptions are grouped under `src/Exception/{Domain}/`.

```
AppException (abstract)
  └── {Domain}Exception (abstract, provides getDomainCode())
      └── ConcreteException (final)
```

### Key classes

| Class | Location | Purpose |
|-------|----------|---------|
| `DomainCode` | `src/Exception/DomainCode.php` | Backed int enum with all domain codes |
| `AppException` | `src/Exception/AppException.php` | Abstract base: computes full code, exposes `getHttpStatus()`, `getMeta()`, `getFullCode()` |
| `ApiExceptionSubscriber` | `src/EventSubscriber/ApiExceptionSubscriber.php` | Catches `AppException` on `kernel.exception`, returns structured JSON |

## API Error Response Format

When an `AppException` is thrown, the `ApiExceptionSubscriber` builds an `ErrorResponseDTO` (`src/DTO/Response/Error/ErrorResponseDTO.php`) and returns:

```json
{
  "code": 15001,
  "httpStatus": 422,
  "meta": { "remainingAttempts": 2 }
}
```

- `code`: `domainCode * 1000 + codeSuffix` (e.g., OTP domain 15 + suffix 1 = 15001)
- `httpStatus`: declared by the exception, also used as the HTTP response status
- `meta`: optional structured data (only included when non-empty)
- No human-readable messages in the response — the frontend maps codes to localized strings

## Domain Code Table

| Domain | Code | Enum value |
|--------|------|------------|
| Integration | 10 | `DomainCode::Integration` |
| AiClient | 11 | `DomainCode::AiClient` |
| Credit | 12 | `DomainCode::Credit` |
| Stripe | 13 | `DomainCode::Stripe` |
| Mailing | 14 | `DomainCode::Mailing` |
| Otp | 15 | `DomainCode::Otp` |
| Prelaunch | 16 | `DomainCode::Prelaunch` |
| Project | 17 | `DomainCode::Project` |
| Script | 18 | `DomainCode::Script` |
| TodoList | 19 | `DomainCode::TodoList` |
| Post | 20 | `DomainCode::Post` |
| User | 21 | `DomainCode::User` |
| Validation | 22 | `DomainCode::Validation` |

## Exception Inventory

| Full Code | Exception | HTTP | Meta | Location |
|-----------|-----------|------|------|----------|
| **OTP (15xxx)** |
| 15001 | `InvalidOtpException` | 422 | `remainingAttempts` | `src/Exception/Otp/` |
| 15002 | `ExpiredOtpException` | 422 | — | `src/Exception/Otp/` |
| 15003 | `MaxAttemptsOtpException` | 429 | — | `src/Exception/Otp/` |
| 15004 | `InvalidPendingTokenException` | 422 | — | `src/Exception/Otp/` |
| 15005 | `ExpiredOtpSessionException` | 401 | — | `src/Exception/Otp/` |
| **Integration (10xxx)** |
| 10001 | `OAuthTokenRevokedException` | 500 | `integrationUuid` | `src/Exception/Integration/` |
| 10002 | `IntegrationNotFoundException` | 404 | — | `src/Exception/Integration/` |
| 10003 | `IntegrationAlreadyExistsException` | 409 | — | `src/Exception/Integration/` |
| **AiClient (11xxx)** |
| 11001 | `AiClientRetryableException` | 503 | — | `src/Exception/AiClient/` |
| 11002 | `AiClientPermanentException` | 500 | — | `src/Exception/AiClient/` |
| **Credit (12xxx)** |
| 12001 | `InsufficientCreditsException` | 402 | `requested`, `available` | `src/Exception/Credit/` |
| **Stripe (13xxx)** |
| 13001 | `CheckoutSessionCreationException` | 400 | — | `src/Exception/Stripe/` |
| 13002 | `WebhookSignatureVerificationException` | 400 | — | `src/Exception/Stripe/` |
| 13003 | `SubscriptionManagementException` | 400 | — | `src/Exception/Stripe/` |
| 13004 | `SubscriptionNotFoundException` | 404 | — | `src/Exception/Stripe/` |
| 13005 | `MissingWebhookSignatureException` | 400 | — | `src/Exception/Stripe/` |
| **Mailing (14xxx)** |
| 14001 | `MailingRetryableException` | 503 | — | `src/Exception/Mailing/` |
| **Prelaunch (16xxx)** |
| 16001 | `RateLimitExceededException` | 429 | — | `src/Exception/Prelaunch/` |
| 16002 | `SubscriberNotFoundException` | 404 | — | `src/Exception/Prelaunch/` |
| 16003 | `PrelaunchNotEnabledException` | 404 | — | `src/Exception/Prelaunch/` |
| **Project (17xxx)** |
| 17001 | `ProjectNotFoundException` | 404 | — | `src/Exception/Project/` |
| 17002 | `ProjectNameConflictException` | 409 | — | `src/Exception/Project/` |
| 17003 | `ProjectLimitReachedException` | 402 | — | `src/Exception/Project/` |
| 17004 | `ProjectAlreadyFinishedException` | 409 | — | `src/Exception/Project/` |
| 17005 | `ProjectAlreadyOpenException` | 409 | — | `src/Exception/Project/` |
| **Script (18xxx)** |
| 18001 | `ScriptNotFoundException` | 404 | — | `src/Exception/Script/` |
| 18002 | `ScriptLimitReachedException` | 402 | — | `src/Exception/Script/` |
| 18003 | `ScriptGenerationNotFoundException` | 404 | — | `src/Exception/Script/` |
| 18004 | `ScriptShotNotFoundException` | 404 | — | `src/Exception/Script/` |
| 18005 | `ScriptTagNotFoundException` | 404 | — | `src/Exception/Script/` |
| 18006 | `ScriptTagTitleConflictException` | 409 | — | `src/Exception/Script/` |
| **TodoList (19xxx)** |
| 19001 | `TodoListNotFoundException` | 404 | — | `src/Exception/TodoList/` |
| 19002 | `TodoListTaskNotFoundException` | 404 | — | `src/Exception/TodoList/` |
| 19003 | `TodoListTagNotFoundException` | 404 | — | `src/Exception/TodoList/` |
| 19004 | `TodoListTagTitleConflictException` | 409 | — | `src/Exception/TodoList/` |
| **User (21xxx)** |
| 21001 | `InvalidPasswordException` | 422 | — | `src/Exception/User/` |
| 21002 | `IncorrectCurrentPasswordException` | 422 | — | `src/Exception/User/` |
| 21003 | `PasswordMismatchException` | 422 | — | `src/Exception/User/` |
| 21004 | `MissingPasswordFieldsException` | 422 | — | `src/Exception/User/` |
| **Validation (22xxx)** |
| 22001 | `AlreadyUsedValueException` | 409 | `propertyName` | `src/Exception/Validation/` |
| **Auth (23xxx)** |
| 23001 | `MissingCredentialsException` | 400 | — | `src/Exception/Auth/` |
| 23002 | `InvalidCredentialsException` | 401 | — | `src/Exception/Auth/` |
| 23003 | `MissingTokenException` | 401 | — | `src/Exception/Auth/` |
| 23004 | `TokenExpiredException` | 401 | — | `src/Exception/Auth/` |
| 23005 | `InvalidTokenException` | 401 | — | `src/Exception/Auth/` |
| 23006 | `EmailNotVerifiedException` | 403 | — | `src/Exception/Auth/` |

## Controller Pattern

Controllers no longer need try-catch for `AppException`. The `ApiExceptionSubscriber` handles them automatically:

```php
// Before (manual catch)
try {
    $otp = $otpService->verify($dto->getPendingOtpToken(), $dto->getCode());
} catch (InvalidOtpException $e) {
    return $this->json(['message' => 'Code incorrect.', 'remainingAttempts' => $e->getRemainingAttempts()], 422);
}

// After (exception propagates to listener)
$otp = $otpService->verify($dto->getPendingOtpToken(), $dto->getCode());
```

All error responses go through exceptions — no inline `$this->json()` error returns in controllers.

## Async Handlers

Message handlers still catch `AppException` subclasses for retry logic. The `ApiExceptionSubscriber` only applies to HTTP kernel events.

## Sentry Integration

`SentryBeforeSendCallback` filters `AppException` with 4xx `httpStatus` (not sent to Sentry). 5xx `AppException` are sent.

## Adding a New Exception

1. If the domain doesn't exist, add a case to `DomainCode` enum and create `src/Exception/{Domain}/{Domain}Exception.php` (abstract, extends `AppException`, returns the new `DomainCode`)
2. Create `src/Exception/{Domain}/{Name}Exception.php` (final, extends domain base)
   - Define `CODE` constant (unique within domain, sequential)
   - Call `parent::__construct(message, CODE, httpStatus, meta)`
   - Add convenience getters for meta fields if needed
3. Add the error code to the frontend mapping (`front/src/services/apiErrorHandler/errorCodeMessages.ts`)
4. Update this doc's Exception Inventory table
