import { useQuery } from "@tanstack/react-query";
import { chatQueryKeys } from "./chatQueryKeys";
import { httpClient } from "~/services/httpClient/httpClient";
import { Chat, type ChatJSON } from "~/models/Chat";

export function useShowChat(chatUuid?: string) {
  const query = useQuery({
    queryKey: chatQueryKeys.show(chatUuid!),
    queryFn: async () => {
      const res = await httpClient.get<ChatJSON>(`/chats/${chatUuid}`);
      return Chat.fromJSON(res.data);
    },
    enabled: !!chatUuid,
  });
  return {
    chat: query.data ?? null,
    isLoading: query.isLoading
  }
}
