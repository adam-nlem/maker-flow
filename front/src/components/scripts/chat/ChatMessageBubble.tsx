import type { ChatMessage } from "~/models/ChatMessage";
import { MessageType } from "~/models/enums/MessageType";
import { formatToFrenchRelative } from "~/utils/dateFormatters";
import SuggestionChips from "./SuggestionChips";
import ScriptVersionBadge from "./ScriptVersionBadge";

interface ChatMessageBubbleProps {
    message: ChatMessage;
    scriptUuid: string;
    onSuggestionClick: (suggestion: string) => void;
}

export default function ChatMessageBubble({ message, scriptUuid, onSuggestionClick }: ChatMessageBubbleProps) {
    if (message.type === MessageType.System) {
        return (
            <div className="flex justify-center">
                <p className="text-body-xs text-gray text-center py-1">{message.content}</p>
            </div>
        );
    }

    if (message.type === MessageType.User) {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%] text">
                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/30 text-sm select-text whitespace-pre-wrap">
                        {message.content}
                    </div>
                    <p className="text-body-xs text-gray mt-1 text-right">{formatToFrenchRelative(message.createdAt)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start">
            <div className="max-w-[80%]">
                <div className="p-2 rounded-xl bg-light-gray/10 border border-light-gray text-sm select-text whitespace-pre-wrap">
                    {message.content}
                </div>

                {message.suggestedAnswers.length > 0 && (
                    <div className="mt-2">
                        <SuggestionChips suggestions={message.suggestedAnswers} onSelect={onSuggestionClick} />
                    </div>
                )}

                {message.scriptVersionUuid && (
                    <ScriptVersionBadge versionUuid={message.scriptVersionUuid} scriptUuid={scriptUuid} />
                )}

                <p className="text-body-xs text-gray mt-1">{formatToFrenchRelative(message.createdAt)}</p>
            </div>
        </div>
    );
}
