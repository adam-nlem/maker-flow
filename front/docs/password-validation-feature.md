# Password Validation Feature

## Overview

Client-side password strength validation with real-time visual feedback. Rules mirror the backend `PasswordHelper` for consistency.

## Password Rules

| Rule | Regex | French Label |
|------|-------|--------------|
| Minimum 8 characters | `password.length >= 8` | Au moins 8 caractères |
| At least one uppercase | `/[A-Z]/` | Au moins une lettre majuscule |
| At least one lowercase | `/[a-z]/` | Au moins une lettre minuscule |
| At least one number | `/[0-9]/` | Au moins un chiffre |
| At least one special character | `/[^a-zA-Z0-9]/` | Au moins un caractère spécial |

## Utility Functions

**File:** `app/utils/passwordValidation.ts`

- `getPasswordRules(password: string): PasswordRule[]` — Returns structured array with `{ label, isValid }` per rule.
- `isPasswordValid(password: string): boolean` — Returns `true` if all rules pass.

### PasswordRule Interface

```typescript
interface PasswordRule {
    label: string;
    isValid: boolean;
}
```

## PasswordRules Component

**File:** `app/components/ui/PasswordRules.tsx`

Pure display component that renders a list of password rules with pass/fail indicators.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `rules` | `PasswordRule[]` | Array of rules from `getPasswordRules()` |

### Visual Design

- Passing rule: `CheckIcon` (outline) + label in `text-primary`
- Failing rule: `XMarkIcon` (outline) + label in `text-danger`
- Icon size: `size-3.5` with `strokeWidth={2}`
- Label size: `text-body-xs`

### Usage

```tsx
import PasswordRules from "~/components/ui/PasswordRules";
import { getPasswordRules } from "~/utils/passwordValidation";

// Show rules only when user has started typing
{password.length > 0 && (
    <PasswordRules rules={getPasswordRules(password)} />
)}
```

## Integration Points

- **Registration page** (`app/routes/register.tsx`): Rules shown below password input, validated on submit.
- **General settings** (`app/components/settings/GeneralSettings.tsx`): Rules shown below "Nouveau mot de passe" input, validated on submit.

## Backend Sync

Rules must match the backend `PasswordHelper` (`back/src/Helper/PasswordHelper.php`). If rules change on the backend, update `passwordValidation.ts` accordingly. See `back/docs/password-validation-feature.md`.
