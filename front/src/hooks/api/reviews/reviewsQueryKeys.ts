import type { ReviewStatus } from "~/models/enums/ReviewStatus";

export const reviewsQueryKeys = {
    all: ['reviews'] as const,
    list: (projectUuid: string, status?: ReviewStatus, searchTerm?: string) =>
        [...reviewsQueryKeys.all, 'list', projectUuid, ...(status ? [status] : []), ...(searchTerm ? [searchTerm] : [])] as const,
    listAll: (projectUuid: string) =>
        [...reviewsQueryKeys.all, 'list', projectUuid] as const,
    detail: (uuid: string) => [...reviewsQueryKeys.all, 'detail', uuid] as const,
    versionFile: (reviewVersionUuid: string, index: number) =>
        [...reviewsQueryKeys.all, 'versionFile', reviewVersionUuid, index] as const,
    cover: (reviewVersionUuid: string) =>
        [...reviewsQueryKeys.all, 'cover', reviewVersionUuid] as const,
    comments: (reviewVersionUuid: string) =>
        [...reviewsQueryKeys.all, 'comments', reviewVersionUuid] as const,
    pendingComments: (projectUuid: string) =>
        [...reviewsQueryKeys.all, 'pendingComments', projectUuid] as const,
    awaitingCurrentUserAction: (projectUuid: string) =>
        [...reviewsQueryKeys.all, 'awaitingCurrentUserAction', projectUuid] as const,
}
