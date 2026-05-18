import type { PostDraftStatus } from "~/models/enums/PostDraftStatus";

export const postDraftsQueryKeys = {
    all: ['postDrafts'] as const,
    list: (projectUuid: string, status?: PostDraftStatus, searchTerm?: string) =>
        [...postDraftsQueryKeys.all, 'list', projectUuid, ...(status ? [status] : []), ...(searchTerm ? [searchTerm] : [])] as const,
    listAll: (projectUuid: string) =>
        [...postDraftsQueryKeys.all, 'list', projectUuid] as const,
    detail: (uuid: string) => [...postDraftsQueryKeys.all, 'detail', uuid] as const,
    revisionFile: (revisionUuid: string, index: number) =>
        [...postDraftsQueryKeys.all, 'revisionFile', revisionUuid, index] as const,
}
