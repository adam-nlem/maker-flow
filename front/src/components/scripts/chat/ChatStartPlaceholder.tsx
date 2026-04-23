import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { ChatAction, chatActionToFrenchTranslation } from "~/models/enums/ChatAction";
import SuggestionChips from "./SuggestionChips";

interface ChatStartPlaceholderProps {
    onActionSelect: (action: ChatAction) => void;
}

const welcomeActions = [ChatAction.GenerateScript, ChatAction.AnalyzeScript, ChatAction.ImproveHook];
const welcomeSuggestions = welcomeActions.map((action) => chatActionToFrenchTranslation[action]);

export default function ChatStartPlaceholder({ onActionSelect }: ChatStartPlaceholderProps) {
    const handleSelect = (suggestion: string) => {
        const action = welcomeActions.find((a) => chatActionToFrenchTranslation[a] === suggestion);
        if (action) onActionSelect(action);
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
            <ChatBubbleLeftRightIcon className="size-8 text-gray" strokeWidth={1.5} />
            <h3 className="text-heading-md">Comment puis-je vous aider ?</h3>
            <SuggestionChips suggestions={welcomeSuggestions} onSelect={handleSelect} />
        </div>
    );
}
