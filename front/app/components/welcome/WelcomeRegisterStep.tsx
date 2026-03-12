import { useNavigate } from "react-router"
import { UserPlusIcon } from "@heroicons/react/24/outline"
import RegisterForm from "~/components/auth/RegisterForm"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { WelcomeStep } from "~/models/enums/WelcomeStep"
import WelcomeStepLayout from "~/components/welcome/WelcomeStepLayout"

export default function WelcomeRegisterStep() {
    const navigate = useNavigate()
    const setWelcomeStep = useOnboardingStore((s) => s.setWelcomeStep)
    const setOtpCredentials = useOnboardingStore((s) => s.setOtpCredentials)

    return (
        <WelcomeStepLayout
            icon={UserPlusIcon}
            title="Créez votre compte"
            subtitle="Commencez gratuitement et gérez vos contenus dès maintenant."
            onBack={() => setWelcomeStep(WelcomeStep.HowItWorks)}
            onNext={() => navigate('/login')}
            nextLabel="J'ai déjà un compte"
        >
            <div className="min-w-sm">

                <RegisterForm
                    onRegistered={({ pendingOtpToken, email }) => {
                        setOtpCredentials(pendingOtpToken, email)
                        setWelcomeStep(WelcomeStep.VerifyOtp)
                    }}
                />
            </div>
        </WelcomeStepLayout>
    )
}
