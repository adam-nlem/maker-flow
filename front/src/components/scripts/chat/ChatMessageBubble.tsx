import type { ChatMessage } from "~/models/ChatMessage";
import { MessageType } from "~/models/enums/MessageType";
import { formatToFrenchRelative } from "~/utils/dateFormatters";
import ChatSuggestionsCard from "./ChatSuggestionsCard";

interface ChatMessageBubbleProps {
    message: ChatMessage;
    scriptUuid: string;
    chatUuid: string;
}

export default function ChatMessageBubble({ message, scriptUuid, chatUuid }: ChatMessageBubbleProps) {
    return (
        <div className={`flex ${message.type === MessageType.User ? "justify-end" : "justify-start"} `}>
            <div className="max-w-[80%]">
                <div className={`p-2 rounded-xl border ${message.type === MessageType.User ? "bg-primary/10 border-primary/30" : "bg-light-gray/10 border-light-gray"} text-sm select-text whitespace-pre-wrap`}>
                    {message.content}
                </div>

                {message.type === MessageType.Ai && message.suggestionUuids.length > 0 && (
                    <ChatSuggestionsCard
                        suggestionUuids={message.suggestionUuids}
                        scriptUuid={scriptUuid}
                        chatUuid={chatUuid}
                    />
                )}

                <p className="text-body-xs text-gray mt-1">{formatToFrenchRelative(message.createdAt)}</p>
            </div>
        </div>
    );
}
