import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ChatMessage, type ChatMessageJSON } from "~/models/ChatMessage";
import { chatMessageQueryKeys } from "./chatMessageQueryKeys";

interface UseListChatMessagesProps {
    chatUuid: string | null;
    limit?: number;
}

export function useListChatMessages({ chatUuid, limit = 50 }: UseListChatMessagesProps) {
    const query = useInfiniteQuery({
        queryKey: chatMessageQueryKeys.list(chatUuid ?? ''),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get<ChatMessageJSON[]>('/chat-messages', {
                params: {
                    chatUuid,
                    page: pageParam,
                    limit,
                },
            });
            return res.data.map((json) => ChatMessage.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
        enabled: !!chatUuid,
    });

    const messages = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        messages,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
