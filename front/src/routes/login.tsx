import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import AuthStepLayout from "~/components/auth/AuthStepLayout"
import LoginForm from "~/components/auth/LoginForm"
import { homePath, onboardingPath, registerPath, verifyOtpPath } from "~/routes/routePaths"
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore"

export default function LoginPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const prefillEmail = useAuthPrefillStore((s) => s.email)

    return (
        <div className="bg-clear bg-dot-pattern min-h-screen relative">
            <AuthStepLayout
                icon={ArrowLeftEndOnRectangleIcon}
                title={t("auth:login.title")}
                subtitle={t("auth:login.subtitle")}
                onBack={() => navigate(onboardingPath)}
                onNext={() => navigate(registerPath)}
                nextLabel={t("auth:login.switchToRegister")}
            >
                <div className="min-w-sm">
                    <LoginForm
                        initialEmail={prefillEmail ?? ""}
                        onLoginSuccess={() => navigate(homePath)}
                        onOtpRequired={({ pendingOtpToken, otpType, email }) => {
                            navigate(verifyOtpPath, {
                                state: { pendingOtpToken, purpose: otpType, email },
                            })
                        }}
                    />
                </div>
            </AuthStepLayout>
        </div>
    )
}
