import { EnvelopeIcon } from "@heroicons/react/24/outline"
import { Button } from "~/components/ui/Button"
import VerifyOtpForm from "~/components/auth/VerifyOtpForm"
import { OtpType } from "~/models/enums/OtpType"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { WelcomeStep } from "~/models/enums/WelcomeStep"

export default function WelcomeVerifyOtpStep() {
    const pendingOtpToken = useOnboardingStore((s) => s.pendingOtpToken)
    const email = useOnboardingStore((s) => s.otpEmail)
    const setWelcomeStep = useOnboardingStore((s) => s.setWelcomeStep)

    if (!pendingOtpToken || !email) return null

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="mb-8 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <EnvelopeIcon className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-heading-2xl text-dark mb-2 text-center">
                Vérification de l'email
            </h2>
            <p className="text-body-md text-gray mb-10 text-center max-w-lg">
                Un code a été envoyé à <span className="text-dark font-medium">{email}</span>
            </p>

            <div className="w-full max-w-sm mb-10">
                <VerifyOtpForm pendingOtpToken={pendingOtpToken} purpose={OtpType.EmailVerification} />
            </div>

            <div className="flex gap-3">
                <Button style="secondary" width="w-auto" onClick={() => setWelcomeStep(WelcomeStep.Register)}>
                    Retour
                </Button>
            </div>
        </div>
    )
}
