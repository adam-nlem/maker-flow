export const projectQueryKeys = {
    all: ['projects'] as const,
    list: (page: number, limit: number) => [...projectQueryKeys.all, 'list', page, limit] as const,
    userModules: (projectUuid: string) => [...projectQueryKeys.all, 'userModules', projectUuid] as const,
}
