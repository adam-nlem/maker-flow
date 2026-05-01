export enum ChapterType {
    OnScreen = 'on_screen',
    OffScreen = 'off_screen',
}

export const chapterTypeTranslationKeys: Record<ChapterType, string> = {
    [ChapterType.OnScreen]: "enums:chapterType.onScreen",
    [ChapterType.OffScreen]: "enums:chapterType.offScreen",
}

export const chapterTypeToBgClass: Record<ChapterType, string> = {
    [ChapterType.OnScreen]: "bg-blue/10",
    [ChapterType.OffScreen]: "bg-purple/10",
}

export const chapterTypeToBorderClass: Record<ChapterType, string> = {
    [ChapterType.OnScreen]: "border border-blue/30",
    [ChapterType.OffScreen]: "border border-purple/30",
}

export const chapterTypeToTextClass: Record<ChapterType, string> = {
    [ChapterType.OnScreen]: "text-blue",
    [ChapterType.OffScreen]: "text-purple",
}

export const chapterTypeOptions = Object.values(ChapterType);
