export enum ChapterType {
    OnScreen = 'on_screen',
    OffScreen = 'off_screen',
}

export const chapterTypeToFrenchTranslation: Record<ChapterType, string> = {
    [ChapterType.OnScreen]: "On-screen",
    [ChapterType.OffScreen]: "Off-screen",
}

export const chapterTypeToBgClass: Record<ChapterType, string> = {
    [ChapterType.OnScreen]: "bg-blue/10",
    [ChapterType.OffScreen]: "bg-purple/10",
}

export const chapterTypeToTextClass: Record<ChapterType, string> = {
    [ChapterType.OnScreen]: "text-blue",
    [ChapterType.OffScreen]: "text-purple",
}
