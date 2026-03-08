export interface PasswordRule {
    label: string;
    isValid: boolean;
}

/**
 * Validates a password against all strength rules and returns per-rule results.
 * Rules mirror the backend PasswordHelper for consistency.
 */
export function getPasswordRules(password: string): PasswordRule[] {
    return [
        {
            label: "Au moins 8 caractères",
            isValid: password.length >= 8,
        },
        {
            label: "Au moins une lettre majuscule",
            isValid: /[A-Z]/.test(password),
        },
        {
            label: "Au moins une lettre minuscule",
            isValid: /[a-z]/.test(password),
        },
        {
            label: "Au moins un chiffre",
            isValid: /[0-9]/.test(password),
        },
        {
            label: "Au moins un caractère spécial",
            isValid: /[^a-zA-Z0-9]/.test(password),
        },
    ];
}

/**
 * Returns true if all password rules pass.
 */
export function isPasswordValid(password: string): boolean {
    return getPasswordRules(password).every((rule) => rule.isValid);
}
