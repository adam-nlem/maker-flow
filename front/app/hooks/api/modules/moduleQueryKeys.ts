export const moduleQueryKeys = {
    all: ['modules'] as const,
    list: (page: number, limit: number) => [...moduleQueryKeys.all, 'list', page, limit] as const,
    icon: (moduleIdentifier: string) => [...moduleQueryKeys.all, 'icon', moduleIdentifier] as const,
}
