import { UserCircleIcon } from "@heroicons/react/24/outline"

import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import CreatorProfileForm from "~/components/scripts/creatorProfile/CreatorProfileForm"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"

export default function OnboardingCreatorProfileStep() {
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const { advanceStep } = useAdvanceOnboardingStep()

    if (!projectUuid) return null

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-lg">
                <OnboardingStepHeader
                    icon={UserCircleIcon}
                    title="Personnalisez votre compte créateur"
                    description="Ces informations permettent à l'IA de s'adapter à votre style."
                />

                <CreatorProfileForm
                    projectUuid={projectUuid}
                    creatorProfile={null}
                    onSuccess={advanceStep}
                    variant="onboarding"
                />

                <div className="mt-6 flex justify-center">
                    <SimpleTextButton onClick={advanceStep}>
                        Passer
                    </SimpleTextButton>
                </div>
            </div>
        </div>
    )
}
