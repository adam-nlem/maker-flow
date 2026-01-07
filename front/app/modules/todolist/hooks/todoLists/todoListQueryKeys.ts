export const todoListQueryKeys = {
    all: ['todoLists'] as const,
    list: (userModuleUuid: string) => [...todoListQueryKeys.all, 'list', userModuleUuid] as const,
}
