export const todoListQueryKeys = {
    all: ['todoLists'] as const,
    list: (projectUuid: string) => [...todoListQueryKeys.all, 'list', projectUuid] as const,
}
