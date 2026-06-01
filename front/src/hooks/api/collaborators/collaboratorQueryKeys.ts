export const collaboratorQueryKeys = {
    all: ['collaborators'] as const,
    list: () => [...collaboratorQueryKeys.all, 'list'] as const,
}
