import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import AuthStepLayout from "~/components/auth/AuthStepLayout"
import LoginForm from "~/components/auth/LoginForm"
import { homePath, registerPath, verifyOtpPath } from "~/routes/routePaths"
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore"

export default function LoginPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const prefillEmail = useAuthPrefillStore((s) => s.email)

    return (
        <AuthStepLayout
            eyebrow={t("auth:login.eyebrow")}
            title={t("auth:login.title")}
            subtitle={t("auth:login.subtitle")}
            helperLink={{
                question: t("auth:login.helperQuestion"),
                linkText: t("auth:login.switchToRegister"),
                onClick: () => navigate(registerPath),
            }}
            trustFooter
        >
            <LoginForm
                initialEmail={prefillEmail ?? ""}
                onLoginSuccess={() => navigate(homePath)}
                onOtpRequired={({ pendingOtpToken, otpType, email }) => {
                    navigate(verifyOtpPath, {
                        state: { pendingOtpToken, purpose: otpType, email },
                    })
                }}
            />
        </AuthStepLayout>
    )
}
