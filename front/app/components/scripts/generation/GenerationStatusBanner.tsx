import { SparklesIcon, XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useShowScriptGeneration } from "~/hooks/api/scriptGenerations/useShowScriptGeneration";
import { useScriptGenerationStore } from "~/stores/scripts/scriptGenerationStore";
import { ScriptGenerationStatus } from "~/models/enums/ScriptGenerationStatus";

interface GenerationStatusBannerProps {
    scriptUuid: string;
}

export default function GenerationStatusBanner({ scriptUuid }: GenerationStatusBannerProps) {
    const activeGenerationUuid = useScriptGenerationStore((s) => s.activeGenerationUuid);
    const clearActiveGeneration = useScriptGenerationStore((s) => s.clearActiveGeneration);

    const { generation } = useShowScriptGeneration({
        generationUuid: activeGenerationUuid,
        scriptUuid,
    });

    if (!activeGenerationUuid || !generation) return null;

    const isInProgress = generation.status === ScriptGenerationStatus.Pending || generation.status === ScriptGenerationStatus.Processing;
    const isFailed = generation.status === ScriptGenerationStatus.Failed;
    const isCompleted = generation.status === ScriptGenerationStatus.Completed;

    if (isCompleted) {
        setTimeout(() => clearActiveGeneration(), 3000);
    }

    return (
        <div className={`mx-6 mt-3 px-4 py-3 rounded-xl border flex flex-row items-center gap-3 ${isInProgress
            ? 'border-primary/30 bg-primary/5'
            : isFailed
                ? 'border-danger/30 bg-danger/5'
                : 'border-green/30 bg-green/5'
            }`}
        >
            {isInProgress && (
                <>
                    <SparklesIcon className="size-5 text-primary shrink-0 animate-pulse" strokeWidth={2} />
                    <div className="flex-1">
                        <span className="text-heading-xs">Génération en cours...</span>
                        <span className="text-body-xs ml-2">L'IA écrit votre script</span>
                    </div>
                </>
            )}

            {isFailed && (
                <>
                    <ExclamationTriangleIcon className="size-5 text-danger shrink-0" strokeWidth={2} />
                    <div className="flex-1">
                        <span className="text-heading-xs text-danger">Échec de la génération</span>
                        {generation.errorMessage && (
                            <span className="text-body-xs ml-2">{generation.errorMessage}</span>
                        )}
                    </div>
                </>
            )}

            {isCompleted && (
                <>
                    <SparklesIcon className="size-5 text-green shrink-0" strokeWidth={2} />
                    <div className="flex-1">
                        <span className="text-heading-xs text-green">Script généré avec succès</span>
                    </div>
                </>
            )}

            {!isInProgress && (
                <button onClick={clearActiveGeneration} className="shrink-0 text-gray hover:text-dark transition-colors cursor-pointer">
                    <XMarkIcon className="size-4" strokeWidth={2} />
                </button>
            )}
        </div>
    );
}
