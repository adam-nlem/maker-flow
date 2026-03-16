import { CheckCircleIcon } from "@heroicons/react/24/outline"

import ScriptEditorPanel from "~/components/scripts/ScriptEditorPanel"
import { Button } from "~/components/ui/Button"
import type { Script } from "~/models/Script"

interface GenerateScriptPreviewPhaseProps {
    script: Script | null
    projectUuid: string
    onNext: () => void
}

export default function GenerateScriptPreviewPhase({ script, projectUuid, onNext }: GenerateScriptPreviewPhaseProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-8 py-12">
            <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 size-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircleIcon className="size-8 text-primary" />
                </div>
                <h2 className="text-heading-3xl text-dark mb-2">
                    Votre script est prêt !
                </h2>
                <p className="text-body-sm text-gray">
                    Voici un aperçu de ce que l'IA a généré pour vous.
                </p>
            </div>

            {script && (
                <div className="w-full max-w-xl rounded-xl border border-light-gray shadow-lg bg-clear overflow-hidden max-h-[60vh] mb-8">
                    <ScriptEditorPanel key={script.uuid} script={script} projectUuid={projectUuid} isReadOnly />
                </div>
            )}

            <Button style="primary" onClick={onNext}>
                Continuer
            </Button>

            <p className="text-body-xs text-gray text-center mt-4">
                Retrouvez votre script dans l'onglet Scripts
            </p>
        </div>
    )
}
