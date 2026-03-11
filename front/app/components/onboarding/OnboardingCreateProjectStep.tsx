import { FolderPlusIcon } from "@heroicons/react/24/outline"

import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import CreateProjectForm from "~/components/projects/CreateProjectForm"

interface OnboardingCreateProjectStepProps {
    onProjectCreated: (projectUuid: string) => void
    onNext: () => void
}

export default function OnboardingCreateProjectStep({ onProjectCreated, onNext }: OnboardingCreateProjectStepProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-md">
                <OnboardingStepHeader
                    icon={FolderPlusIcon}
                    title="Créez votre premier projet"
                    description="Les projets vous permettent de regrouper vos contenus et vos réseaux sociaux."
                />

                <CreateProjectForm onProjectCreated={(uuid) => { onProjectCreated(uuid); onNext() }} buttonStyle="primary" />
            </div>
        </div>
    )
}
