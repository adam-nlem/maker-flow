export const integrationInsightQueryKeys = {
    all: ["integrationInsights"] as const,
    list: (projectUuid: string) => [...integrationInsightQueryKeys.all, "list", projectUuid] as const,
    detail: (integrationUuid: string) => [...integrationInsightQueryKeys.all, "detail", integrationUuid] as const,
};
