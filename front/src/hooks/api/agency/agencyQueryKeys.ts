export const agencyQueryKeys = {
    all: ['agency'] as const,
    current: () => [...agencyQueryKeys.all, 'current'] as const,
}
