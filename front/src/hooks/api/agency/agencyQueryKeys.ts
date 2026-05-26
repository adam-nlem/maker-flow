export const agencyQueryKeys = {
    all: ['agency'] as const,
    current: () => [...agencyQueryKeys.all, 'current'] as const,
    logo: (agencyUuid: string) => [...agencyQueryKeys.all, 'logo', agencyUuid] as const,
    usage: () => [...agencyQueryKeys.all, 'usage'] as const,
}
