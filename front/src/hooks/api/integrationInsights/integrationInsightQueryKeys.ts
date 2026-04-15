export const integrationInsightQueryKeys = {
    all: ["integrationInsights"] as const,
    list: (projectUuid: string, timePeriod: string) => [...integrationInsightQueryKeys.all, "list", projectUuid, timePeriod] as const,
    detail: (integrationUuid: string) => [...integrationInsightQueryKeys.all, "detail", integrationUuid] as const,
};
