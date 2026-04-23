import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { Chat, type ChatJSON } from "~/models/Chat";
import { chatQueryKeys } from "./chatQueryKeys";

interface UpdateChatData {
    chatUuid: string;
    scriptUuid: string;
    title: string;
}

export function useUpdateChat() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: UpdateChatData) => {
            const res = await httpClient.patch<ChatJSON>(`/chats/${data.chatUuid}`, {
                title: data.title,
            });
            return Chat.fromJSON(res.data);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: chatQueryKeys.list(variables.scriptUuid) });
        },
    });

    return {
        updateChat: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
}
