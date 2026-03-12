import { RocketLaunchIcon } from "@heroicons/react/24/outline"
import { Button } from "~/components/ui/Button"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { PreAuthStep } from "~/models/enums/PreAuthStep"

export default function WelcomeHeroStep() {
    const setPreAuthStep = useOnboardingStore((s) => s.setPreAuthStep)
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
            <div className="mb-8 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <RocketLaunchIcon className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-heading-4xl text-dark  mb-4">
                Gérez vos contenus comme un pro
            </h1>

            <p className="text-body-lg text-medium-gray max-w-lg mb-8">
                MakerFlow vous aide à planifier, rédiger et analyser vos contenus vidéo sur Instagram et YouTube.
            </p>

            <Button style="primary" width="w-auto" onClick={() => setPreAuthStep(PreAuthStep.Features)}>
                Découvrir
            </Button>
        </div>
    )
}
