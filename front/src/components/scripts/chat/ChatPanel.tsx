import { SidePanel } from "~/components/ui/SidePanel";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";
import { useChatStore } from "~/stores/scripts/chatStore";
import { useCreateChatMessage } from "~/hooks/api/chatMessages/useCreateChatMessage";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { useShowChat } from "~/hooks/api/chats/useShowChat";

interface ChatPanelProps {
  scriptUuid: string;
  projectUuid: string;
}

export default function ChatPanel({ scriptUuid }: ChatPanelProps) {
  const isOpen = useScriptRightPanelStore((s) => s.activePanel === ScriptRightPanel.Chat);
  const closePanel = useScriptRightPanelStore((s) => s.closePanel);
  const activeChatUuid = useChatStore((s) => s.activeChatUuid);
  const setIsWaitingForAi = useChatStore((s) => s.setIsWaitingForAi);
  const { chat } = useShowChat(activeChatUuid ?? undefined);
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
      width="w-120"
      isOpen={isOpen}
      onClose={closePanel}
      header={<ChatHeader title={chat?.title ?? "Nouveau Chat"} onClose={closePanel} />}
    >
      <div className="relative">
        <div className="pb-40">
          <ChatMessageList
            chatUuid={activeChatUuid}
            scriptUuid={scriptUuid}
            onSuggestionClick={sendMessage}
          />
        </div>
        {activeChatUuid && (
          <div className="sticky bottom-0 left-0 right-0 pointer-events-none">
            <div className="h-8 bg-linear-to-t from-clear to-transparent" />
            <div className="bg-clear pointer-events-auto px-2 pb-2">
              <ChatInput onSend={sendMessage} isPending={isPending} />
            </div>
          </div>
        )}
      </div>
    </SidePanel>
  );
}
