export const postInsightQueryKeys = {
    all: ["postInsights"] as const,
    detail: (postUuid: string) => [...postInsightQueryKeys.all, "detail", postUuid] as const,
};
