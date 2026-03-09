export const scriptTagQueryKeys = {
    all: ['scriptTags'] as const,
    list: (projectUuid: string, searchTerm?: string) => [...scriptTagQueryKeys.all, 'list', projectUuid, searchTerm] as const,
}
