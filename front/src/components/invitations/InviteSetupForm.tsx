import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import PasswordRules from "~/components/ui/PasswordRules"
import { useCompleteInvitation } from "~/hooks/api/invitations/useCompleteInvitation"
import { getPasswordRules, isPasswordValid } from "~/utils/passwordValidation"
import { resolveErrorMessage } from "~/services/apiErrorHandler/errorCodeMessages"
import { HttpException } from "~/services/httpClient/HttpException"
import { Invitation } from "~/models/Invitation"
import { agencyHomePath, clientHomePath } from "~/routes/routePaths"

interface InviteSetupFormProps {
    token: string
    invitation: Invitation
    formSpacing?: string
}

export default function InviteSetupForm({ token, invitation, formSpacing = "space-y-4" }: InviteSetupFormProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)

    const { completeInvitation, isPending } = useCompleteInvitation()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!password.trim()) {
            setError(t("auth:validation.passwordRequired"))
            return
        }
        if (!isPasswordValid(password)) {
            setError(t("auth:validation.passwordCriteriaUnmet"))
            return
        }
        if (password !== confirmPassword) {
            setError(t("auth:validation.passwordMismatch"))
            return
        }

        try {
            const user = await completeInvitation({ token, password })
            navigate(user.isClient ? clientHomePath : agencyHomePath, { replace: true })
        } catch (err) {
            if (err instanceof HttpException) {
                setError(resolveErrorMessage(err))
            }
        }
    }

    return (
        <>
            {error && (
                <div className="mb-4 rounded-md bg-danger/10 p-4">
                    <div className="text-body-sm text-danger">{error}</div>
                </div>
            )}

            <form className={formSpacing} onSubmit={handleSubmit}>
                <Input
                    label={t("auth:fields.firstName")}
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={invitation.firstName ?? ""}
                    readOnly
                    disabled
                />

                <Input
                    label={t("auth:fields.lastName")}
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={invitation.lastName ?? ""}
                    readOnly
                    disabled
                />

                <Input
                    label={t("auth:fields.email")}
                    id="email"
                    name="email"
                    type="email"
                    value={invitation.email}
                    readOnly
                    disabled
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

                <Button type="submit" style="primary" isLoading={isPending} disabled={isPending}>
                    {t("invitations:setup.submit")}
                </Button>
            </form>
        </>
    )
}
