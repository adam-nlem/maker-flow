import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ArrowRightIcon, EnvelopeIcon } from "@heroicons/react/24/outline"

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
}

export default function RegisterForm({ onRegistered, initialEmail = "" }: RegisterFormProps) {
    const { t } = useTranslation()
    const setStoredEmail = useAuthPrefillStore((s) => s.setEmail)

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState(initialEmail)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null)

    const { register, isPending, error } = useRegister()

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        const validationErr = validateRegisterForm({ firstName, lastName, email, password, confirmPassword })
        if (validationErr) {
            setValidationErrorKey(validationErr)
            return
        }
        setValidationErrorKey(null)
        setStoredEmail(email)
        const response = await register({ firstName, lastName, email, password })
        if (response.requiresEmailVerification) {
            onRegistered({ pendingOtpToken: response.pendingOtpToken, email: response.email })
        }
    }

    const errorMessage = (validationErrorKey ? t(validationErrorKey) : null) || (error?.message ?? null)

    return (
        <>
            {errorMessage && (
                <div className="mb-4 rounded-md bg-danger/10 p-3">
                    <p className="text-body-sm text-danger">{errorMessage}</p>
                </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label={t("auth:fields.firstName")}
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />

                    <Input
                        label={t("auth:fields.lastName")}
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>

                <Input
                    label={t("auth:fields.email")}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<EnvelopeIcon className="size-4 text-muted-2" />}
                />

                <Input
                    label={t("auth:fields.password")}
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {password.length > 0 && (
                    <PasswordRules rules={getPasswordRules(password)} />
                )}

                <Input
                    label={t("auth:fields.confirmPassword")}
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button
                    type="submit"
                    style="primary"
                    width="w-full"
                    height="h-11"
                    isLoading={isPending}
                    disabled={isPending}
                >
                    <span>{t("auth:register.submit")}</span>
                    <ArrowRightIcon className="size-4" />
                </Button>
            </form>
        </>
    )
}
