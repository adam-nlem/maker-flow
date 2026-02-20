export const integrationInsightQueryKeys = {
    all: ["integrationInsights"] as const,
    list: (integrationUuid: string) => [...integrationInsightQueryKeys.all, "list", integrationUuid] as const,
    detail: (integrationUuid: string) => [...integrationInsightQueryKeys.all, "detail", integrationUuid] as const,
};
