export const scriptTagQueryKeys = {
    all: ['scriptTags'] as const,
    list: (projectUuid: string) => [...scriptTagQueryKeys.all, 'list', projectUuid] as const,
}
