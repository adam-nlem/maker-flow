export const scriptGenerationQueryKeys = {
    all: ['scriptGenerations'] as const,
    show: (generationUuid: string) => [...scriptGenerationQueryKeys.all, 'show', generationUuid] as const,
    latest: (scriptUuid: string) => [...scriptGenerationQueryKeys.all, 'latest', scriptUuid] as const,
}
