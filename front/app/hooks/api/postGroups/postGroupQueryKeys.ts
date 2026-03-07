export const postGroupQueryKeys = {
    all: ["postGroups"] as const,
    rank: (projectUuid: string) => [...postGroupQueryKeys.all, "rank", projectUuid] as const,
};
