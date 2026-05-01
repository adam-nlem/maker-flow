import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { Chat, type ChatJSON } from "~/models/Chat";
import { chatQueryKeys } from "./chatQueryKeys";

interface UseListPaginatedChatsProps {
    scriptUuid: string;
    limit?: number;
}

export function useListPaginatedChats({ scriptUuid, limit = 20 }: UseListPaginatedChatsProps) {
    const query = useInfiniteQuery({
        queryKey: chatQueryKeys.list(scriptUuid),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get<ChatJSON[]>('/chats', {
                params: {
                    scriptUuid,
                    page: pageParam,
                    limit,
                },
            });
            return res.data.map((json) => Chat.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
    });

    const chats = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        chats,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
