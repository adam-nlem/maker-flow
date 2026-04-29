import { useTranslation } from "react-i18next"

import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import ScriptEditorPanel from "~/components/scripts/ScriptEditorPanel"
import { Button } from "~/components/ui/Button"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore"
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"

export default function OnboardingGenerateScriptStep() {
    const { t } = useTranslation()
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const focusedScriptUuid = useFocusScriptStore((s) => s.focusedScriptUuid)
    const { advanceStep } = useAdvanceOnboardingStep()

    const { scripts } = useListPaginatedScripts({ projectUuid: projectUuid ?? "", limit: 1 })
    const script = scripts.find((s) => s.uuid === focusedScriptUuid) ?? scripts[0] ?? null

    if (!projectUuid) return null

    return (
        <OnboardingStepLayout maxWidth="max-w-3xl">
            <div className="flex flex-col items-center gap-5 w-full h-full">
                <div className="text-center">
                    <h2 className="text-heading-lg">{t("onboarding:generateStep.title")}</h2>
                    <p className="text-body-sm text-gray mt-2">
                        {t("onboarding:generateStep.subtitle")}
                    </p>
                </div>

                {script && (
                    <div className="w-full flex-1 min-h-[60vh] max-h-[60vh] rounded-xl border border-light-gray shadow-lg bg-clear overflow-hidden flex flex-col">
                        <ScriptEditorPanel key={script.uuid} script={script} projectUuid={projectUuid} />
                    </div>
                )}

                <Button style="primary" onClick={advanceStep}>{t("actions.continue")}</Button>
            </div>
        </OnboardingStepLayout>
    )
}
