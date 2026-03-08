# Password Validation Feature

## Overview

Centralized password strength validation enforced on both registration and password change endpoints. The `PasswordHelper` provides static methods for validating passwords against a set of strength rules.

## Password Rules

| Rule | Regex / Check |
|------|---------------|
| Minimum 8 characters | `strlen($password) < 8` |
| At least one uppercase letter | `/[A-Z]/` |
| At least one lowercase letter | `/[a-z]/` |
| At least one number | `/[0-9]/` |
| At least one special character | `/[^a-zA-Z0-9]/` |

## PasswordHelper

**File:** `src/Helper/PasswordHelper.php`

Static helper class (same pattern as `RegexHelper`, `NormalizerHelper`).

### Methods

- `validate(string $password): string[]` — Returns an array of English error messages for each failing rule. Returns an empty array if the password is valid.
- `isValid(string $password): bool` — Returns `true` if all rules pass.

### Constants

- `MIN_LENGTH = 8`
- `REGEX_UPPERCASE = '/[A-Z]/'`
- `REGEX_LOWERCASE = '/[a-z]/'`
- `REGEX_NUMBER = '/[0-9]/'`
- `REGEX_SPECIAL = '/[^a-zA-Z0-9]/'`

## API Endpoints Using Validation

### `POST /api/users/register`

Password validated via `PasswordHelper::validate()` before building the User entity. Returns `422 Unprocessable Entity` with the first error message on failure.

### `PATCH /api/users`

Password validated via `PasswordHelper::validate()` when `newPassword` is provided. Returns `422 Unprocessable Entity` with the first error message on failure.

### Error Response Format

```json
{
    "message": "Password must contain at least one uppercase letter."
}
```

HTTP Status: `422 Unprocessable Entity`

## Frontend Sync

The frontend mirrors these rules in `front/app/utils/passwordValidation.ts` with identical regex patterns. If rules change here, they must also be updated on the frontend. See `front/docs/password-validation-feature.md`.
