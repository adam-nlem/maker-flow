import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import ScriptEditorPanel from "~/components/scripts/ScriptEditorPanel"
import Shimmer from "~/components/ui/Shimmer"
import { Button } from "~/components/ui/Button"
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript"
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore"

export default function OnboardingCreateScriptStep() {
    const { t } = useTranslation()
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const focusedScriptUuid = useFocusScriptStore((s) => s.focusedScriptUuid)
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid)

    const hasResolved = useRef(false)

    const { scripts: existingScripts, isLoading } = useListPaginatedScripts({ projectUuid: projectUuid ?? "", limit: 1 })
    const { createScript } = useCreateScript()
    const { advanceStep } = useAdvanceOnboardingStep()

    const script = existingScripts.find((s) => s.uuid === focusedScriptUuid) ?? null

    useEffect(() => {
        if (!projectUuid || isLoading || hasResolved.current) return
        hasResolved.current = true

        if (existingScripts.length > 0) {
            setFocusedScriptUuid(existingScripts[0].uuid)
        } else {
            createScript({ projectUuid, title: t("onboarding:firstScriptTitle"), publishedAt: new Date().toLocaleDateString("sv-SE") }).then((created) => {
                setFocusedScriptUuid(created.uuid)
            })
        }
    }, [projectUuid, isLoading, existingScripts, createScript, setFocusedScriptUuid])

    if (!projectUuid) return null

    return (
        <OnboardingStepLayout maxWidth="max-w-2xl">
            <div className="flex flex-col items-center gap-5 w-full h-full">
                {script ? (
                    <div className="w-full flex-1 min-h-[60vh] max-h-[60vh] md:min-h-[70vh]  md:max-h-[70vh] rounded-xl border border-light-gray shadow-lg bg-clear overflow-hidden flex flex-col">
                        <ScriptEditorPanel key={script.uuid} script={script} projectUuid={projectUuid} hidePanelTriggers />
                    </div>
                ) : (
                    <div className="w-full max-w-xl flex flex-col gap-3 px-6 py-4">
                        <Shimmer height="h-20" width="w-full" />
                        <Shimmer height="h-20" width="w-full" />
                        <Shimmer height="h-16" width="w-full" />
                    </div>
                )}

                <Button
                    style="primary"
                    disabled={!script}
                    onClick={advanceStep}
                >
                    {t("actions.continue")}
                </Button>
            </div>
        </OnboardingStepLayout>
    )
}
