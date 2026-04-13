export const projectQueryKeys = {
    all: ['projects'] as const,
    list: (limit: number) => [...projectQueryKeys.all, 'list', limit] as const,
    userModules: (projectUuid: string) => [...projectQueryKeys.all, 'userModules', projectUuid] as const,
}
