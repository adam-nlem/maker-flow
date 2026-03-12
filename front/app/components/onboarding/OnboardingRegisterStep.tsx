import { useNavigate } from "react-router"
import { UserPlusIcon } from "@heroicons/react/24/outline"

import RegisterForm from "~/components/auth/RegisterForm"
import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { PreAuthStep } from "~/models/enums/PreAuthStep"

export default function OnboardingRegisterStep() {
    const navigate = useNavigate()
    const setPreAuthStep = useOnboardingStore((s) => s.setPreAuthStep)
    const setOtpCredentials = useOnboardingStore((s) => s.setOtpCredentials)

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <OnboardingStepHeader
                    icon={UserPlusIcon}
                    title="Créez votre compte"
                    description="Commencez gratuitement et gérez vos contenus dès maintenant."
                />

                <RegisterForm
                    onRegistered={({ pendingOtpToken, email }) => {
                        setOtpCredentials(pendingOtpToken, email)
                        setPreAuthStep(PreAuthStep.VerifyOtp)
                    }}
                />

                <div className="mt-6 flex flex-col items-center gap-3">
                    <SimpleTextButton onClick={() => navigate('/login')}>
                        J'ai déjà un compte
                    </SimpleTextButton>
                    <SimpleTextButton onClick={() => setPreAuthStep(PreAuthStep.HowItWorks)}>
                        Retour
                    </SimpleTextButton>
                </div>
            </div>
        </div>
    )
}
