import { useState } from "react"

import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { useLogin } from "~/hooks/api/users/useLogin"
import { OtpType } from "~/models/enums/OtpType"
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore"

interface LoginFormProps {
    onLoginSuccess: () => void
    onOtpRequired: (data: { pendingOtpToken: string; otpType: OtpType; email: string }) => void
    initialEmail?: string
}

export default function LoginForm({ onLoginSuccess, onOtpRequired, initialEmail = "" }: LoginFormProps) {
    const setStoredEmail = useAuthPrefillStore((s) => s.setEmail)

    const [email, setEmail] = useState(initialEmail)
    const [password, setPassword] = useState("")

    const { login, isPending, error } = useLogin()

    const errorMessage = error?.message ?? null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStoredEmail(email)
        const response = await login({ email, password })

        if (response.requiresOtp) {
            onOtpRequired({
                pendingOtpToken: response.pendingOtpToken,
                otpType: OtpType.Login,
                email,
            })
        } else if (response.requiresEmailVerification) {
            onOtpRequired({
                pendingOtpToken: response.pendingOtpToken,
                otpType: OtpType.EmailVerification,
                email: response.email ?? email,
            })
        } else {
            onLoginSuccess()
        }
    }

    return (
        <>
            {errorMessage && (
                <div className="mb-4 rounded-md bg-danger/10 p-4">
                    <div className="text-body-sm text-danger">{errorMessage}</div>
                </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                    label="Adresse email"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                    label="Mot de passe"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    type="submit"
                    style="primary"
                    isLoading={isPending}
                    disabled={isPending}
                >
                    Connexion
                </Button>
            </form>
        </>
    )
}
