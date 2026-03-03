export const integrationQueryKeys = {
    all: ['integrations'] as const,
    list: (projectUuid: string) => [...integrationQueryKeys.all, 'list', projectUuid] as const,
};
