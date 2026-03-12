import { SparklesIcon } from "@heroicons/react/24/outline"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import GenerateScriptPreviewPhase from "~/components/onboarding/GenerateScriptPreviewPhase"
import GenerateScriptGeneratingPhase from "~/components/onboarding/GenerateScriptGeneratingPhase"
import ScriptBriefForm from "~/components/scripts/generation/ScriptBriefForm"
import ScriptEditorPanel from "~/components/scripts/ScriptEditorPanel"
import { useGenerateScriptFlow } from "~/hooks/useGenerateScriptFlow"
import { GenerateScriptPhase } from "~/models/enums/GenerateScriptPhase"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"

export default function OnboardingGenerateScriptStep() {
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const initialScriptUuid = useFocusScriptStore((s) => s.focusedScriptUuid)
    const { advanceStep } = useAdvanceOnboardingStep()

    const { phase, script, isPending, isFailed, messageIndex, handleBriefSubmit } = useGenerateScriptFlow({
        projectUuid: projectUuid!,
        initialScriptUuid,
    })

    if (!projectUuid) return null

    if (phase === GenerateScriptPhase.Preview) {
        return <GenerateScriptPreviewPhase script={script} projectUuid={projectUuid} onNext={advanceStep} />
    }

    return (
        <OnboardingStepLayout maxWidth="max-w-5xl">
            <div className="flex gap-10 w-full max-w-5xl">
                <div className="w-full flex-1 min-h-[75vh]  max-h-[75vh] rounded-xl border border-light-gray shadow-lg bg-clear overflow-hidden flex flex-col">
                    {script ? (
                        <ScriptEditorPanel key={script.uuid} script={script} projectUuid={projectUuid} isReadOnly />
                    ) : (
                        <div className="flex items-center justify-center h-64 text-body-sm text-gray">
                            Le script apparaîtra ici...
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto max-h-150 scrollbar-none">
                    {phase === GenerateScriptPhase.Generating ? (
                        <GenerateScriptGeneratingPhase isFailed={isFailed} messageIndex={messageIndex} onNext={advanceStep} />
                    ) : (
                        <ScriptBriefForm
                            onSubmit={handleBriefSubmit}
                            isPending={isPending}
                            submitLabel="Générer avec l'IA"
                            submitIcon={SparklesIcon}
                            variant="onboarding"
                        />
                    )}
                </div>
            </div>
        </OnboardingStepLayout>
    )
}
