import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router"

import AuthStepLayout from "~/components/auth/AuthStepLayout"
import LoginForm from "~/components/auth/LoginForm"
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
                onBack={() => navigate("/onboarding")}
                onNext={() => navigate("/register")}
                nextLabel="Créer un compte"
            >
                <div className="min-w-sm">
                    <LoginForm
                        initialEmail={prefillEmail ?? ""}
                        onLoginSuccess={() => navigate("/")}
                        onOtpRequired={({ pendingOtpToken, otpType, email }) => {
                            navigate("/verify-otp", {
                                state: { pendingOtpToken, purpose: otpType, email },
                            })
                        }}
                    />
                </div>
            </AuthStepLayout>
        </div>
    )
}
