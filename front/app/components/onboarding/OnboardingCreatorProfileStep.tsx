import { UserCircleIcon } from "@heroicons/react/24/outline"

import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import CreatorProfileForm from "~/components/scripts/creatorProfile/CreatorProfileForm"

interface OnboardingCreatorProfileStepProps {
    projectUuid: string
    onNext: () => void
}

export default function OnboardingCreatorProfileStep({ projectUuid, onNext }: OnboardingCreatorProfileStepProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-lg">
                <OnboardingStepHeader
                    icon={UserCircleIcon}
                    title="Personnalisez votre IA"
                    description="Ces informations permettent à l'IA de s'adapter à votre style."
                />

                <CreatorProfileForm
                    projectUuid={projectUuid}
                    creatorProfile={null}
                    onSuccess={onNext}
                    variant="onboarding"
                />

                <div className="mt-6 flex justify-center">
                    <SimpleTextButton onClick={onNext}>
                        Passer
                    </SimpleTextButton>
                </div>
            </div>
        </div>
    )
}
