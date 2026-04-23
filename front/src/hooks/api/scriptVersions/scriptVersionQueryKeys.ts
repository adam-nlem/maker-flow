export const scriptVersionQueryKeys = {
    all: ['scriptVersions'] as const,
    list: (scriptUuid: string) => [...scriptVersionQueryKeys.all, 'list', scriptUuid] as const,
    show: (versionUuid: string) => [...scriptVersionQueryKeys.all, 'show', versionUuid] as const,
}
