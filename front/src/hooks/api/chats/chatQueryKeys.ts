export const chatQueryKeys = {
    all: ['chats'] as const,
    list: (scriptUuid: string) => [...chatQueryKeys.all, 'list', scriptUuid] as const,
    show: (chatUuid: string) => [...chatQueryKeys.all, 'show', chatUuid] as const,
}
