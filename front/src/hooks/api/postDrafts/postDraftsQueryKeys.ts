export const postDraftsQueryKeys = {
    all: ['postDrafts'] as const,
    list: (projectUuid: string, limit: number) =>
        [...postDraftsQueryKeys.all, 'list', projectUuid, limit] as const,
    listAll: (projectUuid: string) =>
        [...postDraftsQueryKeys.all, 'list', projectUuid] as const,
    detail: (uuid: string) => [...postDraftsQueryKeys.all, 'detail', uuid] as const,
}
