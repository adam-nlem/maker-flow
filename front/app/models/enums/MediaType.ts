export enum MediaType {
    Image = 'image',
    Video = 'video',
    Carousel = 'carousel',
}

export const mediaTypeToFrenchTranslation: Record<MediaType, string> = {
    [MediaType.Image]: "Image",
    [MediaType.Video]: "Video",
    [MediaType.Carousel]: "Carousel",

};

export const mediaTypeOptions = Object.values(MediaType)