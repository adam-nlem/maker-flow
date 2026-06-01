import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import AuthStepLayout from "~/components/auth/AuthStepLayout"
import RegisterForm from "~/components/auth/RegisterForm"
import { loginPath, verifyOtpPath } from "~/routes/routePaths"
import { OtpType } from "~/models/enums/OtpType"
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore"

export default function RegisterPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const prefillEmail = useAuthPrefillStore((s) => s.email)

    return (
        <AuthStepLayout
            eyebrow={t("auth:register.eyebrow")}
            title={t("auth:register.title")}
            subtitle={t("auth:register.subtitle")}
            helperLink={{
                question: t("auth:register.helperQuestion"),
                linkText: t("auth:register.switchToLogin"),
                onClick: () => navigate(loginPath),
            }}
        >
            <RegisterForm
                initialEmail={prefillEmail ?? ""}
                onRegistered={({ pendingOtpToken, email }) => {
                    navigate(verifyOtpPath, {
                        state: {
                            pendingOtpToken,
                            purpose: OtpType.EmailVerification,
                            email,
                        },
                    })
                }}
            />
        </AuthStepLayout>
    )
}
