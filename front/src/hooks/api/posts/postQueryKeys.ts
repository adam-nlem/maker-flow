export const postQueryKeys = {
    all: ["posts"] as const,
    list: (projectUuid: string, platform: string | null, searchTerm?: string) => [...postQueryKeys.all, "list", projectUuid, platform ?? "all", searchTerm ?? "all"] as const,
    search: (projectUuid: string) => [...postQueryKeys.all, "search", projectUuid] as const,
    rank: (integrationUuid: string) => [...postQueryKeys.all, "rank", integrationUuid] as const,
    thumbnail: (postUuid: string) => [...postQueryKeys.all, "thumbnail", postUuid] as const,
};
