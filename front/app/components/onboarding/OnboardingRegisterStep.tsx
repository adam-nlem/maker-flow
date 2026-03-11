import { useNavigate } from "react-router"
import { UserPlusIcon } from "@heroicons/react/24/outline"

import RegisterForm from "~/components/auth/RegisterForm"
import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import SimpleTextButton from "~/components/ui/SimpleTextButton"

interface OnboardingRegisterStepProps {
    onRegistered: (pendingOtpToken: string, email: string) => void
    onBack: () => void
}

export default function OnboardingRegisterStep({ onRegistered, onBack }: OnboardingRegisterStepProps) {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <OnboardingStepHeader
                    icon={UserPlusIcon}
                    title="Créez votre compte"
                    description="Commencez gratuitement et gérez vos contenus dès maintenant."
                />

                <RegisterForm
                    onRegistered={({ pendingOtpToken, email }) => onRegistered(pendingOtpToken, email)}
                />

                <div className="mt-6 flex flex-col items-center gap-3">
                    <SimpleTextButton onClick={() => navigate('/login')}>
                        J'ai déjà un compte
                    </SimpleTextButton>
                    <SimpleTextButton onClick={onBack}>
                        Retour
                    </SimpleTextButton>
                </div>
            </div>
        </div>
    )
}
