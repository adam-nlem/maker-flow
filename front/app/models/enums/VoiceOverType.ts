export enum VoiceOverType {
    Calm = 'calm',
    Dynamic = 'dynamic',
    Dramatic = 'dramatic',
    Neutral = 'neutral',
}

export const voiceOverTypeToLabel: Record<VoiceOverType, string> = {
    [VoiceOverType.Calm]: "Calme",
    [VoiceOverType.Dynamic]: "Dynamique",
    [VoiceOverType.Dramatic]: "Dramatique",
    [VoiceOverType.Neutral]: "Neutre",
}

export const voiceOverTypeToBgClass: Record<VoiceOverType, string> = {
    [VoiceOverType.Calm]: "bg-blue/30",
    [VoiceOverType.Dynamic]: "bg-yellow/30",
    [VoiceOverType.Dramatic]: "bg-red/30",
    [VoiceOverType.Neutral]: "bg-green/30",
}

export const voiceOverTypeToTextClass: Record<VoiceOverType, string> = {
    [VoiceOverType.Calm]: "text-blue",
    [VoiceOverType.Dynamic]: "text-yellow",
    [VoiceOverType.Dramatic]: "text-red",
    [VoiceOverType.Neutral]: "text-green",
}
