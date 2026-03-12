import { useEffect, useRef, useState } from "react"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import ScriptEditorPanel from "~/components/scripts/ScriptEditorPanel"
import Shimmer from "~/components/ui/Shimmer"
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript"
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts"
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
        <OnboardingStepLayout maxWidth="max-w-xl" disableNextButton={!script}>
            {script ? (
                <div className="w-full max-w-xl flex-1 min-h-[75vh]  max-h-[75vh] rounded-xl border border-light-gray shadow-lg bg-clear overflow-hidden flex flex-col">
                    <ScriptEditorPanel key={script.uuid} script={script} projectUuid={projectUuid} hidePanelTriggers />
                </div>
            ) : (
                <div className="w-full max-w-xl flex flex-col gap-3 px-6 py-4">
                    <Shimmer height="h-20" width="w-full" />
                    <Shimmer height="h-20" width="w-full" />
                    <Shimmer height="h-16" width="w-full" />
                </div>
            )}
        </OnboardingStepLayout>
    )
}
