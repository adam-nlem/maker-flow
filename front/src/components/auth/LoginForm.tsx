import { useState } from "react"
import { useTranslation } from "react-i18next"
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
    const { t } = useTranslation()
    const setStoredEmail = useAuthPrefillStore((s) => s.setEmail)

    const [email, setEmail] = useState(initialEmail)
    const [password, setPassword] = useState("")

    const { login, isPending } = useLogin()

    const handleSubmit = async (e: React.SubmitEvent) => {
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
            <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                    label={t("auth:fields.email")}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                    label={t("auth:fields.password")}
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
                    {t("auth:login.submit")}
                </Button>
            </form>
        </>
    )
}
