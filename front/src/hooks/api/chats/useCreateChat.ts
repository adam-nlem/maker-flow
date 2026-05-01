import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { Chat, type ChatJSON } from "~/models/Chat";
import type { AiModel } from "~/models/enums/AiModel";
import { chatQueryKeys } from "./chatQueryKeys";

interface CreateChatData {
    scriptUuid: string;
    aiModel: AiModel;
}

export function useCreateChat() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: CreateChatData) => {
            const res = await httpClient.post<ChatJSON>('/chats', {
                scriptUuid: data.scriptUuid,
                aiModel: data.aiModel,
            });
            return Chat.fromJSON(res.data);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: chatQueryKeys.list(variables.scriptUuid) });
        },
    });

    return {
        createChat: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
