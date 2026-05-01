import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MessageType } from "~/models/enums/MessageType";
import { useListChatMessages } from "~/hooks/api/chatMessages/useListChatMessages";
import { useChatStore } from "~/stores/scripts/chatStore";
import Shimmer from "~/components/ui/Shimmer";
import ChatMessageBubble from "./ChatMessageBubble";
import AiTypingIndicator from "./AiTypingIndicator";

interface ChatMessageListProps {
  chatUuid: string | null;
  scriptUuid: string;
  onSuggestionClick?: (suggestion: string) => void;
}

export default function ChatMessageList({ chatUuid, scriptUuid }: ChatMessageListProps) {
  const { t } = useTranslation();
  const isWaitingForAi = useChatStore((s) => s.isWaitingForAi);
  const setIsWaitingForAi = useChatStore((s) => s.setIsWaitingForAi);

  const { messages, isLoading, isLoadingMore, hasMore, listMore } = useListChatMessages({
    chatUuid,
    isWaitingForAi,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasMore && !isLoadingMore) {
      listMore();
    }
  }, [hasMore, isLoadingMore, listMore]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isWaitingForAi]);

  useEffect(() => {
    if (!isWaitingForAi || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.type === MessageType.Ai) {
      setIsWaitingForAi(false);
    }
  }, [messages, isWaitingForAi, setIsWaitingForAi]);

  if (!chatUuid) {
    return (
      <div className="p-4">
        <p className="text-body-sm text-gray">
          {t("scripts:chat.messages.intro")}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Shimmer height="h-12" width="w-3/4" />
        <div className="flex justify-end">
          <Shimmer height="h-10" width="w-2/3" />
        </div>
        <Shimmer height="h-16" width="w-3/4" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="p-4">
        <p className="text-body-sm text-gray">
          {t("scripts:chat.messages.intro")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <Shimmer height="h-8" width="w-1/2" />
        </div>
      )}
      {messages.map((message) => (
        <ChatMessageBubble
          key={message.uuid}
          message={message}
          scriptUuid={scriptUuid}
          chatUuid={chatUuid}
        />
      ))}
      {isWaitingForAi && <AiTypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
