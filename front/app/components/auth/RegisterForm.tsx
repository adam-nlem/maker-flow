import { useState } from "react"

import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import PasswordRules from "~/components/ui/PasswordRules"
import { useRegister } from "~/hooks/api/users/useRegister"
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore"
import { getPasswordRules } from "~/utils/passwordValidation"
import { validateRegisterForm } from "~/utils/registerValidation"

interface RegisterFormProps {
    onRegistered: (data: { pendingOtpToken: string; email: string }) => void
    initialEmail?: string
    formSpacing?: string
}

export default function RegisterForm({ onRegistered, initialEmail = "", formSpacing = "space-y-4" }: RegisterFormProps) {
    const setStoredEmail = useAuthPrefillStore((s) => s.setEmail)

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState(initialEmail)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [validationError, setValidationError] = useState<string | null>(null)

    const { register, isPending, error } = useRegister()

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        const validationErr = validateRegisterForm({ firstName, lastName, email, password, confirmPassword })
        if (validationErr) {
            setValidationError(validationErr)
            return
        }
        setValidationError(null)
        setStoredEmail(email)
        const response = await register({ firstName, lastName, email, password })
        if (response.requiresEmailVerification) {
            onRegistered({ pendingOtpToken: response.pendingOtpToken, email: response.email })
        }
    }

    const errorMessage = validationError || (error?.message ?? null)

    return (
        <>
            {errorMessage && (
                <div className="mb-4 rounded-md bg-danger/10 p-4">
                    <div className="text-body-sm text-danger">{errorMessage}</div>
                </div>
            )}

            <form className={formSpacing} onSubmit={handleSubmit}>
                <Input
                    label="Prénom"
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    fullWidth
                />

                <Input
                    label="Nom"
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    fullWidth
                />

                <Input
                    label="Adresse email"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                />

                <Input
                    label="Mot de passe"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                />
                {password.length > 0 && (
                    <PasswordRules rules={getPasswordRules(password)} />
                )}

                <Input
                    label="Confirmer le mot de passe"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                />

                <Button
                    type="submit"
                    style="primary"
                    isLoading={isPending}
                    disabled={isPending}
                >
                    Créer mon compte
                </Button>
            </form>
        </>
    )
}
