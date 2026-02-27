export enum RetentionCueType {
    Question = 'question',
    Teaser = 'teaser',
    PatternBreak = 'pattern_break',
    Cliffhanger = 'cliffhanger',
}

export const retentionCueTypeToFrenchTranslation: Record<RetentionCueType, string> = {
    [RetentionCueType.Question]: "Question",
    [RetentionCueType.Teaser]: "Teaser",
    [RetentionCueType.PatternBreak]: "Rupture de pattern",
    [RetentionCueType.Cliffhanger]: "Cliffhanger",
}

export const retentionCueTypeToBgClass: Record<RetentionCueType, string> = {
    [RetentionCueType.Question]: "bg-blue/30",
    [RetentionCueType.Teaser]: "bg-purple/30",
    [RetentionCueType.PatternBreak]: "bg-orange/30",
    [RetentionCueType.Cliffhanger]: "bg-pink/30",
}

export const retentionCueTypeToTextClass: Record<RetentionCueType, string> = {
    [RetentionCueType.Question]: "text-blue",
    [RetentionCueType.Teaser]: "text-purple",
    [RetentionCueType.PatternBreak]: "text-orange",
    [RetentionCueType.Cliffhanger]: "text-pink",
}
