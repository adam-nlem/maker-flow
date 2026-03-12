import { EnvelopeIcon } from "@heroicons/react/24/outline"
import VerifyOtpForm from "~/components/auth/VerifyOtpForm"
import { OtpType } from "~/models/enums/OtpType"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { WelcomeStep } from "~/models/enums/WelcomeStep"
import WelcomeStepLayout from "~/components/welcome/WelcomeStepLayout"

export default function WelcomeVerifyOtpStep() {
    const pendingOtpToken = useOnboardingStore((s) => s.pendingOtpToken)
    const email = useOnboardingStore((s) => s.otpEmail)
    const setWelcomeStep = useOnboardingStore((s) => s.setWelcomeStep)

    if (!pendingOtpToken || !email) return null

    return (
        <WelcomeStepLayout
            icon={EnvelopeIcon}
            title="Vérification de l'email"
            subtitle={<>Un code a été envoyé à <span className="text-dark font-medium">{email}</span></>}
            onBack={() => setWelcomeStep(WelcomeStep.Register)}
        >
            <VerifyOtpForm pendingOtpToken={pendingOtpToken} purpose={OtpType.EmailVerification} />
        </WelcomeStepLayout>
    )
}
