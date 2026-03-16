import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
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
        <OnboardingStepLayout maxWidth="max-w-md">
            <CreateProjectForm onProjectCreated={handleProjectCreated} buttonStyle="primary" />
        </OnboardingStepLayout>
    )
}
