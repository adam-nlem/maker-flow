import { useNavigate } from "react-router"
import { UserPlusIcon } from "@heroicons/react/24/outline"
import { Button } from "~/components/ui/Button"
import RegisterForm from "~/components/auth/RegisterForm"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { WelcomeStep } from "~/models/enums/WelcomeStep"

export default function WelcomeRegisterStep() {
    const navigate = useNavigate()
    const setWelcomeStep = useOnboardingStore((s) => s.setWelcomeStep)
    const setOtpCredentials = useOnboardingStore((s) => s.setOtpCredentials)

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="mb-8 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlusIcon className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-heading-2xl text-dark mb-2 text-center">
                Créez votre compte
            </h2>
            <p className="text-body-md text-gray mb-10 text-center max-w-lg">
                Commencez gratuitement et gérez vos contenus dès maintenant.
            </p>

            <div className="w-full max-w-sm mb-10">
                <RegisterForm
                    onRegistered={({ pendingOtpToken, email }) => {
                        setOtpCredentials(pendingOtpToken, email)
                        setWelcomeStep(WelcomeStep.VerifyOtp)
                    }}
                />
            </div>

            <div className="flex gap-3">
                <Button style="outline" width="w-auto" onClick={() => setWelcomeStep(WelcomeStep.HowItWorks)}>
                    Retour
                </Button>
                <Button style="secondary" width="w-auto" onClick={() => navigate('/login')}>
                    J'ai déjà un compte
                </Button>
            </div>
        </div>
    )
}
