export enum ContentType {
    ShortForm = 'short_form',
    LongForm = 'long_form',
}

export const contentTypeTranslationKeys: Record<ContentType, string> = {
    [ContentType.ShortForm]: "enums:contentType.shortForm",
    [ContentType.LongForm]: "enums:contentType.longForm",
}

export const contentTypeOptions = Object.values(ContentType);
