export enum Tone {
    Calm = 'calm',
    Dynamic = 'dynamic',
    Dramatic = 'dramatic',
    Neutral = 'neutral',
    CasualFriendly = 'casual_friendly',
    EducationalAuthoritative = 'educational_authoritative',
    HypeEnergetic = 'hype_energetic',
    FunnySarcastic = 'funny_sarcastic',
    StorytellingEmotional = 'storytelling_emotional',
}

export const toneToFrenchTranslation: Record<Tone, string> = {
    [Tone.Calm]: "Calme",
    [Tone.Dynamic]: "Dynamique",
    [Tone.Dramatic]: "Dramatique",
    [Tone.Neutral]: "Neutre",
    [Tone.CasualFriendly]: "Casual & amical",
    [Tone.EducationalAuthoritative]: "Éducatif & autoritaire",
    [Tone.HypeEnergetic]: "Hype & énergique",
    [Tone.FunnySarcastic]: "Drôle & sarcastique",
    [Tone.StorytellingEmotional]: "Storytelling & émotionnel",
}

export const toneToBgClass: Record<Tone, string> = {
    [Tone.Calm]: "bg-blue/30",
    [Tone.Dynamic]: "bg-yellow/30",
    [Tone.Dramatic]: "bg-red/30",
    [Tone.Neutral]: "bg-green/30",
    [Tone.CasualFriendly]: "bg-purple/30",
    [Tone.EducationalAuthoritative]: "bg-dark/30",
    [Tone.HypeEnergetic]: "bg-orange/30",
    [Tone.FunnySarcastic]: "bg-pink/30",
    [Tone.StorytellingEmotional]: "bg-teal/30",
}

export const toneToTextClass: Record<Tone, string> = {
    [Tone.Calm]: "text-blue",
    [Tone.Dynamic]: "text-yellow",
    [Tone.Dramatic]: "text-red",
    [Tone.Neutral]: "text-green",
    [Tone.CasualFriendly]: "text-purple",
    [Tone.EducationalAuthoritative]: "text-dark",
    [Tone.HypeEnergetic]: "text-orange",
    [Tone.FunnySarcastic]: "text-pink",
    [Tone.StorytellingEmotional]: "text-teal",
}

export const toneOptions = Object.values(Tone);
