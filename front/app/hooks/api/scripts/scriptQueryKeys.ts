export const scriptQueryKeys = {
    all: ['scripts'] as const,
    list: (projectUuid: string) => [...scriptQueryKeys.all, 'list', projectUuid] as const,
    calendar: (projectUuid: string, year: number, month: number) =>
        [...scriptQueryKeys.all, 'calendar', projectUuid, year, month] as const,
    parts: (scriptUuid: string, generationUuid?: string) =>
        generationUuid
            ? [...scriptQueryKeys.all, 'parts', scriptUuid, generationUuid] as const
            : [...scriptQueryKeys.all, 'parts', scriptUuid] as const,
}
