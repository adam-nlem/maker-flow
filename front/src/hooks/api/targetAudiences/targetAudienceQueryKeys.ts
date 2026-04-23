export const targetAudienceQueryKeys = {
    all: ['targetAudiences'] as const,
    list: (projectUuid: string) => [...targetAudienceQueryKeys.all, 'list', projectUuid] as const,
}
