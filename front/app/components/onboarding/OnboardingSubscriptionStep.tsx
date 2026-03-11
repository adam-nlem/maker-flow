import { useEffect } from "react"
import { useNavigate } from "react-router"
import { SparklesIcon } from "@heroicons/react/24/outline"

import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import { Button } from "~/components/ui/Button"
import PlanSelector from "~/components/settings/subscription/PlanSelector"
import { useCompleteOnboardingStep } from "~/hooks/api/onboarding/useCompleteOnboardingStep"
import { useDismissOnboarding } from "~/hooks/api/onboarding/useDismissOnboarding"
import { OnboardingStep } from "~/models/enums/OnboardingStep"

export default function OnboardingSubscriptionStep() {
    const navigate = useNavigate()
    const { completeStep } = useCompleteOnboardingStep()
    const { dismiss, isPending } = useDismissOnboarding()

    useEffect(() => {
        completeStep(OnboardingStep.ShowSubscriptions)
    }, [completeStep])

    const handleFinish = async () => {
        await dismiss()
        navigate('/', { replace: true })
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-3xl">
                <OnboardingStepHeader
                    icon={SparklesIcon}
                    title="Découvrez nos offres"
                    description="Choisissez l'abonnement qui correspond à vos besoins pour débloquer toutes les fonctionnalités."
                />

                <div className="mb-8">
                    <PlanSelector />
                </div>

                <div className="flex justify-center">
                    <Button
                        style="primary"
                        width="w-auto"
                        onClick={handleFinish}
                        isLoading={isPending}
                        disabled={isPending}
                    >
                        Terminer
                    </Button>
                </div>
            </div>
        </div>
    )
}
