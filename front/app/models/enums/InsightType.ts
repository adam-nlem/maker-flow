export enum InsightType {
    Post = 'post',
    Integration = 'integration',
}

export const insightTypeToFrenchTranslation: Record<InsightType, string> = {
    [InsightType.Post]: "Contenus",
    [InsightType.Integration]: "Comptes",
};


export const insightTypeOptions = Object.values(InsightType)