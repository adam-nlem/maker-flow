import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import CreateProjectForm from "~/components/projects/CreateProjectForm"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"

export default function OnboardingCreateProjectStep() {
    const setFocusedProjectUuid = useFocusProjectStore((s) => s.setFocusedProjectUuid)
    const { advanceStep } = useAdvanceOnboardingStep()

    const handleProjectCreated = async (uuid: string) => {
        setFocusedProjectUuid(uuid)
        await advanceStep()
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-md">
                <OnboardingStepHeader
                    title="Créez votre premier projet"
                    description="Les projets vous permettent de regrouper vos contenus et vos réseaux sociaux."
                />

                <CreateProjectForm onProjectCreated={handleProjectCreated} buttonStyle="primary" />
            </div>
        </div>
    )
}
