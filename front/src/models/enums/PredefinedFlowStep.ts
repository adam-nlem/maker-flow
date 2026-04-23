export enum PredefinedFlowStep {
    TargetAudience = 'target_audience',
    Goal = 'goal',
    Duration = 'duration',
    ReferenceScript = 'reference_script',
    KeyPoints = 'key_points',
}

export const predefinedFlowStepOrder = [
    PredefinedFlowStep.TargetAudience,
    PredefinedFlowStep.Goal,
    PredefinedFlowStep.Duration,
    PredefinedFlowStep.ReferenceScript,
    PredefinedFlowStep.KeyPoints,
];

export const predefinedFlowStepToFrenchQuestion: Record<PredefinedFlowStep, string> = {
    [PredefinedFlowStep.TargetAudience]: "Quelle est votre audience cible ?",
    [PredefinedFlowStep.Goal]: "Quel est l'objectif de cette vidéo ?",
    [PredefinedFlowStep.Duration]: "Quelle durée pour la vidéo ?",
    [PredefinedFlowStep.ReferenceScript]: "Souhaitez-vous utiliser un script existant comme référence ? (optionnel)",
    [PredefinedFlowStep.KeyPoints]: "Y a-t-il des points clés à aborder ? (optionnel)",
};
