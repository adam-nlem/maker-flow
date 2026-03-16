import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"

import AuthStepLayout from "~/components/auth/AuthStepLayout"
import LoginForm from "~/components/auth/LoginForm"
import { homePath, onboardingPath, registerPath, verifyOtpPath } from "~/routes/routePaths"
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore"

export default function LoginPage() {
    const navigate = useNavigate()
    const prefillEmail = useAuthPrefillStore((s) => s.email)

    return (
        <div className="bg-clear bg-dot-pattern min-h-screen relative">
            <AuthStepLayout
                icon={ArrowLeftEndOnRectangleIcon}
                title="Connexion"
                subtitle="Connectez-vous pour retrouver vos contenus."
                onBack={() => navigate(onboardingPath)}
                onNext={() => navigate(registerPath)}
                nextLabel="Créer un compte"
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
