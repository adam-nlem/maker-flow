export const postGroupQueryKeys = {
    all: ["postGroups"] as const,
    list: (projectUuid: string, searchTerm?: string) => [...postGroupQueryKeys.all, "list", projectUuid, searchTerm ?? "all"] as const,
    show: (postGroupUuid: string) => [...postGroupQueryKeys.all, "show", postGroupUuid] as const,
    rank: (projectUuid: string) => [...postGroupQueryKeys.all, "rank", projectUuid] as const,
};
