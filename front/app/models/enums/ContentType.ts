export enum ContentType {
    ShortForm = 'short_form',
    LongForm = 'long_form',
}

export const contentTypeToFrenchTranslation: Record<ContentType, string> = {
    [ContentType.ShortForm]: "Format court",
    [ContentType.LongForm]: "Format long",
}
