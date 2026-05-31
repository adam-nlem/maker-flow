export const projectQueryKeys = {
    all: ['projects'] as const,
    list: (limit: number) => [...projectQueryKeys.all, 'list', limit] as const,
    show: (projectUuid: string) => [...projectQueryKeys.all, 'show', projectUuid] as const,
    logo: (projectUuid: string) => [...projectQueryKeys.all, 'logo', projectUuid] as const,
    userModules: (projectUuid: string) => [...projectQueryKeys.all, 'userModules', projectUuid] as const,
}
