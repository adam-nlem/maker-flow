import { isPasswordValid } from "~/utils/passwordValidation"

interface RegisterFormData {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
}

/**
 * Validates a register form and returns the first error message, or null if valid.
 */
export function validateRegisterForm({ firstName, lastName, email, password, confirmPassword }: RegisterFormData): string | null {
    if (!firstName.trim()) return "Le prénom est requis"
    if (!lastName.trim()) return "Le nom est requis"
    if (!email.trim()) return "L'email est requis"
    if (!password.trim()) return "Le mot de passe est requis"
    if (!isPasswordValid(password)) return "Le mot de passe ne respecte pas les critères de sécurité"
    if (!confirmPassword.trim()) return "La confirmation du mot de passe est requise"
    if (password !== confirmPassword) return "Les mots de passe ne correspondent pas"
    return null
}
