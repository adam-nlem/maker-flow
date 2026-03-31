export const postGroupQueryKeys = {
    all: ["postGroups"] as const,
    list: (projectUuid: string) => [...postGroupQueryKeys.all, "list", projectUuid] as const,
    rank: (projectUuid: string) => [...postGroupQueryKeys.all, "rank", projectUuid] as const,
};
