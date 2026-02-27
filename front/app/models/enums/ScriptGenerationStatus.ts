export enum ScriptGenerationStatus {
    Pending = 'pending',
    Processing = 'processing',
    Completed = 'completed',
    Failed = 'failed',
}

export const scriptGenerationStatusToFrenchTranslation: Record<ScriptGenerationStatus, string> = {
    [ScriptGenerationStatus.Pending]: "En attente",
    [ScriptGenerationStatus.Processing]: "Génération en cours",
    [ScriptGenerationStatus.Completed]: "Terminé",
    [ScriptGenerationStatus.Failed]: "Échoué",
}

export const scriptGenerationStatusToBgClass: Record<ScriptGenerationStatus, string> = {
    [ScriptGenerationStatus.Pending]: "bg-yellow/30",
    [ScriptGenerationStatus.Processing]: "bg-blue/30",
    [ScriptGenerationStatus.Completed]: "bg-green/30",
    [ScriptGenerationStatus.Failed]: "bg-red/30",
}

export const scriptGenerationStatusToTextClass: Record<ScriptGenerationStatus, string> = {
    [ScriptGenerationStatus.Pending]: "text-yellow",
    [ScriptGenerationStatus.Processing]: "text-blue",
    [ScriptGenerationStatus.Completed]: "text-green",
    [ScriptGenerationStatus.Failed]: "text-red",
}
