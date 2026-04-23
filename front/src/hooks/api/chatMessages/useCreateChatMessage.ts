import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ChatMessage, type ChatMessageJSON } from "~/models/ChatMessage";
import type { ChatAction } from "~/models/enums/ChatAction";
import { chatMessageQueryKeys } from "./chatMessageQueryKeys";

interface CreateChatMessageData {
    chatUuid: string;
    content: string;
    chatAction?: ChatAction;
    parentMessageUuid?: string;
    metadata?: Record<string, unknown>;
}

export function useCreateChatMessage() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: CreateChatMessageData) => {
            const res = await httpClient.post<ChatMessageJSON>('/chat-messages', {
                chatUuid: data.chatUuid,
                content: data.content,
                ...(data.chatAction && { chatAction: data.chatAction }),
                ...(data.parentMessageUuid && { parentMessageUuid: data.parentMessageUuid }),
                ...(data.metadata && { metadata: data.metadata }),
            });
            return ChatMessage.fromJSON(res.data);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: chatMessageQueryKeys.list(variables.chatUuid) });
        },
    });

    return {
        createChatMessage: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
