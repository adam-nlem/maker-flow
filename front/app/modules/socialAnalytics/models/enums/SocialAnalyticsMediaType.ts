export enum SocialAnalyticsMediaType {
    Image = 'image',
    Video = 'video',
    Carousel = 'carousel',
}

export const socialAnalyticsMediaTypeToFrenchTranslation: Record<SocialAnalyticsMediaType, string> = {
    [SocialAnalyticsMediaType.Image]: "Image",
    [SocialAnalyticsMediaType.Video]: "Video",
    [SocialAnalyticsMediaType.Carousel]: "Carousel",

};

export const socialAnalyticsMediaTypeOptions = Object.values(SocialAnalyticsMediaType)