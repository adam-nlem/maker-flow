import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import PlanSelector from "~/components/settings/subscription/PlanSelector"

export default function OnboardingSubscriptionStep() {
    return (
        <OnboardingStepLayout maxWidth="max-w-3xl">
            <PlanSelector />
        </OnboardingStepLayout>
    )
}
