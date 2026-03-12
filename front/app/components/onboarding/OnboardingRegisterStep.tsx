import { useNavigate } from "react-router"
import RegisterForm from "~/components/auth/RegisterForm"
import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { WelcomeStep } from "~/models/enums/WelcomeStep"

export default function OnboardingRegisterStep() {
    const navigate = useNavigate()
    const setWelcomeStep = useOnboardingStore((s) => s.setWelcomeStep)
    const setOtpCredentials = useOnboardingStore((s) => s.setOtpCredentials)

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <OnboardingStepHeader />

                <RegisterForm
                    onRegistered={({ pendingOtpToken, email }) => {
                        setOtpCredentials(pendingOtpToken, email)
                        setWelcomeStep(WelcomeStep.VerifyOtp)
                    }}
                />

                <div className="mt-6 flex flex-col items-center gap-3">
                    <SimpleTextButton onClick={() => navigate('/login')}>
                        J'ai déjà un compte
                    </SimpleTextButton>
                    <SimpleTextButton onClick={() => setWelcomeStep(WelcomeStep.HowItWorks)}>
                        Retour
                    </SimpleTextButton>
                </div>
            </div>
        </div>
    )
}
