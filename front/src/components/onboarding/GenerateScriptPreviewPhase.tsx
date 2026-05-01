import { useTranslation } from "react-i18next"
import ScriptEditorPanel from "~/components/scripts/ScriptEditorPanel"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import { Button } from "~/components/ui/Button"
import type { Script } from "~/models/Script"

interface GenerateScriptPreviewPhaseProps {
    script: Script | null
    projectUuid: string
    onNext: () => void
}

export default function GenerateScriptPreviewPhase({ script, projectUuid, onNext }: GenerateScriptPreviewPhaseProps) {
    const { t } = useTranslation()
    return (
        <OnboardingStepLayout maxWidth="max-w-xl">
            <div className="flex flex-col items-center gap-5 w-full">
                {script && (
                    <div className="w-full rounded-xl border border-light-gray shadow-lg bg-clear overflow-hidden max-h-[60vh]">
                        <ScriptEditorPanel key={script.uuid} script={script} projectUuid={projectUuid} isReadOnly />
                    </div>
                )}

                <Button style="primary" onClick={onNext}>
                    {t("actions.continue")}
                </Button>

                <p className="text-body-xs text-gray text-center">
                    {t("onboarding:findScriptHint")}
                </p>
            </div>
        </OnboardingStepLayout>
    )
}
