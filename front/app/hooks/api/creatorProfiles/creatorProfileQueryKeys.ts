export const creatorProfileQueryKeys = {
    all: ['creatorProfiles'] as const,
    show: (projectUuid: string) => [...creatorProfileQueryKeys.all, 'show', projectUuid] as const,
}
