export const todoListTaskQueryKeys = {
    all: ['todoListTasks'] as const,
    list: (todoListUuid: string) => [...todoListTaskQueryKeys.all, 'list', todoListUuid] as const,
}
