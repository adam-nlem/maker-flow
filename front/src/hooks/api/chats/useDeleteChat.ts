import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { chatQueryKeys } from "./chatQueryKeys";

interface DeleteChatData {
    chatUuid: string;
    scriptUuid: string;
}

export function useDeleteChat() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: DeleteChatData) => {
            await httpClient.delete(`/chats/${data.chatUuid}`);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: chatQueryKeys.list(variables.scriptUuid) });
        },
    });

    return {
        deleteChat: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
}
