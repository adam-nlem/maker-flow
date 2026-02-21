export const scriptQueryKeys = {
    all: ['scripts'] as const,
    list: (projectUuid: string) => [...scriptQueryKeys.all, 'list', projectUuid] as const,
    parts: (scriptUuid: string) => [...scriptQueryKeys.all, 'parts', scriptUuid] as const,
}
