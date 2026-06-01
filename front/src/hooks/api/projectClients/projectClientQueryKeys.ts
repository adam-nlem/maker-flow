export const projectClientQueryKeys = {
    all: ['projectClients'] as const,
    list: (projectUuid: string) => ['projectClients', 'list', projectUuid] as const,
}
