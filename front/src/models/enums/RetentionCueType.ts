export enum RetentionCueType {
    Question = 'question',
    Teaser = 'teaser',
    PatternBreak = 'pattern_break',
    Cliffhanger = 'cliffhanger',
}

export const retentionCueTypeOptions = Object.values(RetentionCueType);

export const retentionCueTypeTranslationKeys: Record<RetentionCueType, string> = {
    [RetentionCueType.Question]: "enums:retentionCueType.question",
    [RetentionCueType.Teaser]: "enums:retentionCueType.teaser",
    [RetentionCueType.PatternBreak]: "enums:retentionCueType.patternBreak",
    [RetentionCueType.Cliffhanger]: "enums:retentionCueType.cliffhanger",
}

export const retentionCueTypeToBgClass: Record<RetentionCueType, string> = {
    [RetentionCueType.Question]: "bg-blue/10",
    [RetentionCueType.Teaser]: "bg-purple/10",
    [RetentionCueType.PatternBreak]: "bg-orange/10",
    [RetentionCueType.Cliffhanger]: "bg-pink/10",
}

export const retentionCueTypeToBorderClass: Record<RetentionCueType, string> = {
    [RetentionCueType.Question]: "border border-blue/30",
    [RetentionCueType.Teaser]: "border border-purple/30",
    [RetentionCueType.PatternBreak]: "border border-orange/30",
    [RetentionCueType.Cliffhanger]: "border border-pink/30",
}

export const retentionCueTypeToTextClass: Record<RetentionCueType, string> = {
    [RetentionCueType.Question]: "text-blue",
    [RetentionCueType.Teaser]: "text-purple",
    [RetentionCueType.PatternBreak]: "text-orange",
    [RetentionCueType.Cliffhanger]: "text-pink",
}
