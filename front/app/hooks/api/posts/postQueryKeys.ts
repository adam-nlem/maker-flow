export const postQueryKeys = {
    all: ["posts"] as const,
    list: (integrationUuid: string) => [...postQueryKeys.all, "list", integrationUuid] as const,
    rank: (integrationUuid: string) => [...postQueryKeys.all, "rank", integrationUuid] as const,
    thumbnail: (postUuid: string) => [...postQueryKeys.all, "thumbnail", postUuid] as const,
};
