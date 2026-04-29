import { UserPlusIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import AuthStepLayout from "~/components/auth/AuthStepLayout"
import RegisterForm from "~/components/auth/RegisterForm"
import { loginPath, onboardingPath, verifyOtpPath } from "~/routes/routePaths"
import { OtpType } from "~/models/enums/OtpType"
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore"

export default function RegisterPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const prefillEmail = useAuthPrefillStore((s) => s.email)

    return (
        <div className="bg-clear bg-dot-pattern min-h-screen relative">
            <AuthStepLayout
                icon={UserPlusIcon}
                title={t("auth:register.title")}
                subtitle={t("auth:register.subtitle")}
                onBack={() => navigate(onboardingPath)}
                onNext={() => navigate(loginPath)}
                nextLabel={t("auth:register.switchToLogin")}
            >
                <div className="min-w-sm">
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
                </div>
            </AuthStepLayout>
        </div>
    )
}
