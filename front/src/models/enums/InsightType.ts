export enum InsightType {
    Post = 'post',
    Integration = 'integration',
}

export const insightTypeTranslationKeys: Record<InsightType, string> = {
    [InsightType.Post]: "enums:insightType.post",
    [InsightType.Integration]: "enums:insightType.integration",
};


export const insightTypeOptions = Object.values(InsightType)