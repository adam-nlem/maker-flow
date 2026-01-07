export const todoListTagQueryKeys = {
    all: ['todoListTags'] as const,
    list: (todoListUuid: string, searchTerm?: string) => [...todoListTagQueryKeys.all, 'list', todoListUuid, searchTerm] as const,
}
