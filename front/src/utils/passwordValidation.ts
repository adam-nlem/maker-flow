export interface PasswordRule {
    labelKey: string;
    isValid: boolean;
}

/**
 * Validates a password against all strength rules and returns per-rule results.
 * Each rule carries an i18n key (consumers translate via `t()`).
 * Rules mirror the backend PasswordHelper for consistency.
 */
export function getPasswordRules(password: string): PasswordRule[] {
    return [
        {
            labelKey: "auth:passwordRules.minLength",
            isValid: password.length >= 8,
        },
        {
            labelKey: "auth:passwordRules.uppercase",
            isValid: /[A-Z]/.test(password),
        },
        {
            labelKey: "auth:passwordRules.lowercase",
            isValid: /[a-z]/.test(password),
        },
        {
            labelKey: "auth:passwordRules.digit",
            isValid: /[0-9]/.test(password),
        },
        {
            labelKey: "auth:passwordRules.specialChar",
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
