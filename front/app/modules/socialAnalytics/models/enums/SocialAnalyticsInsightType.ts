export enum SocialAnalyticsInsightType {
    Post = 'post',
    Integration = 'integration',
}

export const socialAnalyticsInsightTypeToFrenchTranslation: Record<SocialAnalyticsInsightType, string> = {
    [SocialAnalyticsInsightType.Post]: "Contenus",
    [SocialAnalyticsInsightType.Integration]: "Comptes",
};


export const socialAnalyticsInsightTypeOptions = Object.values(SocialAnalyticsInsightType)