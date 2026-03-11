import { SparklesIcon } from "@heroicons/react/24/outline"

import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import GenerateScriptPreviewPhase from "~/components/onboarding/GenerateScriptPreviewPhase"
import GenerateScriptGeneratingPhase from "~/components/onboarding/GenerateScriptGeneratingPhase"
import ScriptBriefForm from "~/components/scripts/generation/ScriptBriefForm"
import ScriptEditorPanel from "~/components/scripts/ScriptEditorPanel"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useGenerateScriptFlow } from "~/hooks/useGenerateScriptFlow"
import { GenerateScriptPhase } from "~/models/enums/GenerateScriptPhase"

interface OnboardingGenerateScriptStepProps {
    projectUuid: string
    scriptUuid: string | null
    onNext: () => void
}

export default function OnboardingGenerateScriptStep({ projectUuid, scriptUuid: initialScriptUuid, onNext }: OnboardingGenerateScriptStepProps) {
    const { phase, script, isPending, isFailed, messageIndex, handleBriefSubmit } = useGenerateScriptFlow({
        projectUuid,
        initialScriptUuid,
    })

    if (phase === GenerateScriptPhase.Preview) {
        return <GenerateScriptPreviewPhase script={script} projectUuid={projectUuid} onNext={onNext} />
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-8">
            <div className="flex flex-col">
                <OnboardingStepHeader
                    icon={SparklesIcon}
                    title="Générez votre premier script"
                    description="L'IA va créer un script vidéo complet basé sur vos indications."
                />

                <div className="flex gap-10 w-full max-w-5xl">
                    <div className="flex-1 rounded-xl border border-light-gray shadow-lg bg-clear overflow-hidden max-h-[75vh]">
                        {script ? (
                            <ScriptEditorPanel key={script.uuid} script={script} projectUuid={projectUuid} isReadOnly />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-body-sm text-medium-gray">
                                Le script apparaîtra ici...
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col overflow-y-auto max-h-150 scrollbar-none">
                        {phase === GenerateScriptPhase.Generating ? (
                            <GenerateScriptGeneratingPhase isFailed={isFailed} messageIndex={messageIndex} onNext={onNext} />
                        ) : (
                            <>
                                <ScriptBriefForm
                                    onSubmit={handleBriefSubmit}
                                    isPending={isPending}
                                    submitLabel="Générer avec l'IA"
                                    submitIcon={SparklesIcon}
                                    variant="onboarding"
                                />

                                <div className="mt-6 flex justify-center">
                                    <SimpleTextButton onClick={onNext}>
                                        Passer
                                    </SimpleTextButton>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
