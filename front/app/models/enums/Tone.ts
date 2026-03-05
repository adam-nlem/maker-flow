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
    [Tone.Calm]: "bg-blue/10",
    [Tone.Dynamic]: "bg-yellow/10",
    [Tone.Dramatic]: "bg-red/10",
    [Tone.Neutral]: "bg-green/10",
    [Tone.CasualFriendly]: "bg-purple/10",
    [Tone.EducationalAuthoritative]: "bg-dark/10",
    [Tone.HypeEnergetic]: "bg-orange/10",
    [Tone.FunnySarcastic]: "bg-pink/10",
    [Tone.StorytellingEmotional]: "bg-teal/10",
}

export const toneToBorderClass: Record<Tone, string> = {
    [Tone.Calm]: "border border-blue/30",
    [Tone.Dynamic]: "border border-yellow/30",
    [Tone.Dramatic]: "border border-red/30",
    [Tone.Neutral]: "border border-green/30",
    [Tone.CasualFriendly]: "border border-purple/30",
    [Tone.EducationalAuthoritative]: "border border-dark/30",
    [Tone.HypeEnergetic]: "border border-orange/30",
    [Tone.FunnySarcastic]: "border border-pink/30",
    [Tone.StorytellingEmotional]: "border border-teal/30",
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
