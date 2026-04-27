import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { SidePanel } from "~/components/ui/SidePanel";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";
import { useChatStore } from "~/stores/scripts/chatStore";
import { useCreateChatMessage } from "~/hooks/api/chatMessages/useCreateChatMessage";
import ChatHistoryBar from "./ChatHistoryBar";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";

interface ChatPanelProps {
    scriptUuid: string;
    projectUuid: string;
}

export default function ChatPanel({ scriptUuid, projectUuid }: ChatPanelProps) {
    const isOpen = useScriptRightPanelStore((s) => s.activePanel === ScriptRightPanel.Chat);
    const closePanel = useScriptRightPanelStore((s) => s.closePanel);
    const activeChatUuid = useChatStore((s) => s.activeChatUuid);
    const setIsWaitingForAi = useChatStore((s) => s.setIsWaitingForAi);

    const { createChatMessage, isPending } = useCreateChatMessage();

    const sendMessage = async (content: string) => {
        if (!activeChatUuid) return;
        setIsWaitingForAi(true);
        await createChatMessage({
            chatUuid: activeChatUuid,
            content,
        });
    };

    return (
        <SidePanel
            title="Chat IA"
            icon={ChatBubbleLeftRightIcon}
            width="w-120"
            isOpen={isOpen}
            onClose={closePanel}
            toolbar={<ChatHistoryBar scriptUuid={scriptUuid} projectUuid={projectUuid} />}
            footer={
                activeChatUuid ? (
                    <ChatInput onSend={sendMessage} isPending={isPending} />
                ) : undefined
            }
        >
            <ChatMessageList
                chatUuid={activeChatUuid}
                scriptUuid={scriptUuid}
                onSuggestionClick={sendMessage}
            />
        </SidePanel>
    );
}
