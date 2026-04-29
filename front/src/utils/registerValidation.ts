import { isPasswordValid } from "~/utils/passwordValidation"

interface RegisterFormData {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
}

/**
 * Validates a register form and returns the first failing i18n key, or null if valid.
 * Callers run the returned key through `t()` to render the localized message.
 */
export function validateRegisterForm({ firstName, lastName, email, password, confirmPassword }: RegisterFormData): string | null {
    if (!firstName.trim()) return "auth:validation.firstNameRequired"
    if (!lastName.trim()) return "auth:validation.lastNameRequired"
    if (!email.trim()) return "auth:validation.emailRequired"
    if (!password.trim()) return "auth:validation.passwordRequired"
    if (!isPasswordValid(password)) return "auth:validation.passwordCriteriaUnmet"
    if (!confirmPassword.trim()) return "auth:validation.confirmPasswordRequired"
    if (password !== confirmPassword) return "auth:validation.passwordMismatch"
    return null
}
