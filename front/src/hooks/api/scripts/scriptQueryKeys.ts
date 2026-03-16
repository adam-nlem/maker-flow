import type { ScriptStatus } from "~/models/enums/ScriptStatus";

export const scriptQueryKeys = {
    all: ['scripts'] as const,
    list: (projectUuid: string, status?: ScriptStatus) => [...scriptQueryKeys.all, 'list', projectUuid, ...(status ? [status] : [])] as const,
    calendar: (projectUuid: string, year: number, month: number) =>
        [...scriptQueryKeys.all, 'calendar', projectUuid, year, month] as const,
    parts: (scriptUuid: string, generationUuid?: string) =>
        generationUuid
            ? [...scriptQueryKeys.all, 'parts', scriptUuid, generationUuid] as const
            : [...scriptQueryKeys.all, 'parts', scriptUuid] as const,
}
