export const chatMessageQueryKeys = {
    all: ['chatMessages'] as const,
    list: (chatUuid: string) => [...chatMessageQueryKeys.all, 'list', chatUuid] as const,
}
