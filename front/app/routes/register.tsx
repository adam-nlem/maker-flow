import { UserPlusIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router"

import AuthStepLayout from "~/components/auth/AuthStepLayout"
import RegisterForm from "~/components/auth/RegisterForm"
import { OtpType } from "~/models/enums/OtpType"
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore"

export default function RegisterPage() {
    const navigate = useNavigate()
    const prefillEmail = useAuthPrefillStore((s) => s.email)

    return (
        <div className="bg-clear bg-dot-pattern min-h-screen relative">
            <AuthStepLayout
                icon={UserPlusIcon}
                title="Créez votre compte"
                subtitle="Commencez gratuitement et gérez vos contenus dès maintenant."
                onBack={() => navigate("/onboarding")}
                onNext={() => navigate("/login")}
                nextLabel="J'ai déjà un compte"
            >
                <div className="min-w-sm">
                    <RegisterForm
                        initialEmail={prefillEmail ?? ""}
                        onRegistered={({ pendingOtpToken, email }) => {
                            navigate("/verify-otp", {
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
