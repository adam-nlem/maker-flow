export enum MediaType {
    Image = 'image',
    Video = 'video',
    Carousel = 'carousel',
}

export const mediaTypeTranslationKeys: Record<MediaType, string> = {
    [MediaType.Image]: "enums:mediaType.image",
    [MediaType.Video]: "enums:mediaType.video",
    [MediaType.Carousel]: "enums:mediaType.carousel",
};

export const mediaTypeOptions = Object.values(MediaType)