export const scriptGenerationQueryKeys = {
    all: ['scriptGenerations'] as const,
    show: (generationUuid: string) => [...scriptGenerationQueryKeys.all, 'show', generationUuid] as const,
    list: (scriptUuid: string) => [...scriptGenerationQueryKeys.all, 'list', scriptUuid] as const,
}
