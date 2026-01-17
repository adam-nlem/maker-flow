export const integrationQueryKeys = {
    all: ['integrations'] as const,
    list: (userModuleUuid: string) => [...integrationQueryKeys.all, 'list', userModuleUuid] as const,
    providerIcon: (provider: string) => [...integrationQueryKeys.all, 'providerIcon', provider] as const,
};
