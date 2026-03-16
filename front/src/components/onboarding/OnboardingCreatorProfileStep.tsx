import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import CreatorProfileForm from "~/components/scripts/creatorProfile/CreatorProfileForm"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"

export default function OnboardingCreatorProfileStep() {
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const { advanceStep } = useAdvanceOnboardingStep()

    if (!projectUuid) return null

    return (
        <OnboardingStepLayout maxWidth="max-w-lg">
            <CreatorProfileForm
                projectUuid={projectUuid}
                creatorProfile={null}
                onSuccess={advanceStep}
                variant="onboarding"
            />
        </OnboardingStepLayout>
    )
}
