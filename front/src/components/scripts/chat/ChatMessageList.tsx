import { useEffect, useRef } from "react";
import { useListChatMessages } from "~/hooks/api/chatMessages/useListChatMessages";
import { useChatStore } from "~/stores/scripts/chatStore";
import type { ChatAction } from "~/models/enums/ChatAction";
import Shimmer from "~/components/ui/Shimmer";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatStartPlaceholder from "./ChatStartPlaceholder";
import AiTypingIndicator from "./AiTypingIndicator";

interface ChatMessageListProps {
    chatUuid: string | null;
    scriptUuid: string;
    projectUuid: string;
    onActionSelect: (action: ChatAction) => void;
    onSuggestionClick: (suggestion: string) => void;
}

export default function ChatMessageList({ chatUuid, scriptUuid, onActionSelect, onSuggestionClick }: ChatMessageListProps) {
    const { messages, isLoading } = useListChatMessages({ chatUuid });
    const isWaitingForAi = useChatStore((s) => s.isWaitingForAi);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, isWaitingForAi]);

    if (!chatUuid) {
        return (
            <div className="p-4">
                <ChatStartPlaceholder onActionSelect={onActionSelect} />
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
                <ChatStartPlaceholder onActionSelect={onActionSelect} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-4">
            {messages.map((message) => (
                <ChatMessageBubble
                    key={message.uuid}
                    message={message}
                    scriptUuid={scriptUuid}
                    onSuggestionClick={onSuggestionClick}
                />
            ))}
            {isWaitingForAi && <AiTypingIndicator />}
            <div ref={bottomRef} />
        </div>
    );
}
