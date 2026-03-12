import { useEffect, useRef, useState } from "react"
import OnboardingStepHeader from "~/components/onboarding/OnboardingStepHeader"
import ScriptEditorPanel from "~/components/scripts/ScriptEditorPanel"
import Shimmer from "~/components/ui/Shimmer"
import { Button } from "~/components/ui/Button"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript"
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore"
import type { Script } from "~/models/Script"

export default function OnboardingCreateScriptStep() {
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid)


    const [script, setScript] = useState<Script | null>(null)
    const hasResolved = useRef(false)

    const { scripts: existingScripts, isLoading } = useListPaginatedScripts({ projectUuid: projectUuid ?? "", limit: 1 })
    const { createScript } = useCreateScript()

    useEffect(() => {
        if (!projectUuid || isLoading || hasResolved.current) return
        hasResolved.current = true

        if (existingScripts.length > 0) {
            setScript(existingScripts[0])
            setFocusedScriptUuid(existingScripts[0].uuid)
        } else {
            createScript({ projectUuid, title: "Mon premier script" }).then((created) => {
                setScript(created)
                setFocusedScriptUuid(created.uuid)
            })
        }
    }, [projectUuid, isLoading, existingScripts, createScript, setFocusedScriptUuid])

    if (!projectUuid) return null

    return (
        <div className="h-screen flex flex-col items-center px-6 pt-24 pb-6">
            <div className="w-full max-w-xl shrink-0">
                <OnboardingStepHeader
                    title="Créez votre premier script"
                    description="Voici votre premier script vidéo. Vous pourrez le modifier plus tard."
                    disableNextButton={!script}
                />
            </div>

            {script ? (
                <div className="w-full max-w-xl flex-1 min-h-0 rounded-xl border border-light-gray shadow-lg bg-clear overflow-hidden flex flex-col">
                    <ScriptEditorPanel key={script.uuid} script={script} projectUuid={projectUuid} />
                </div>
            ) : (
                <div className="w-full max-w-xl flex flex-col gap-3 px-6 py-4">
                    <Shimmer height="h-20" width="w-full" />
                    <Shimmer height="h-20" width="w-full" />
                    <Shimmer height="h-16" width="w-full" />
                </div>
            )}
        </div>
    )
}
