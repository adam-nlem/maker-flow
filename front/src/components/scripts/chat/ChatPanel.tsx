import { useTranslation } from "react-i18next";
import { SidePanel } from "~/components/ui/SidePanel";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";
import { useChatStore } from "~/stores/scripts/chatStore";
import { useCreateChatMessage } from "~/hooks/api/chatMessages/useCreateChatMessage";
import { useCreateChat } from "~/hooks/api/chats/useCreateChat";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { useShowChat } from "~/hooks/api/chats/useShowChat";
import { AiModel } from "~/models/enums/AiModel";

interface ChatPanelProps {
  scriptUuid: string;
  projectUuid: string;
}

export default function ChatPanel({ scriptUuid }: ChatPanelProps) {
  const { t } = useTranslation();
  const isOpen = useScriptRightPanelStore((s) => s.activePanel === ScriptRightPanel.Chat);
  const closePanel = useScriptRightPanelStore((s) => s.closePanel);
  const activeChatUuid = useChatStore((s) => s.activeChatUuid);
  const setActiveChatUuid = useChatStore((s) => s.setActiveChatUuid);
  const setIsWaitingForAi = useChatStore((s) => s.setIsWaitingForAi);
  const { chat } = useShowChat(activeChatUuid ?? undefined);
  const { createChat, isPending: isCreatingChat } = useCreateChat();
  const { createChatMessage, isPending: isSendingMessage } = useCreateChatMessage();

  const sendMessage = async (content: string, aiModel: AiModel) => {
    let chatUuid = activeChatUuid;
    if (!chatUuid) {
      const newChat = await createChat({ scriptUuid, aiModel });
      setActiveChatUuid(newChat.uuid);
      chatUuid = newChat.uuid;
    }
    setIsWaitingForAi(true);
    await createChatMessage({ chatUuid, content });
  };

  return (
    <SidePanel
      width="w-120"
      isOpen={isOpen}
      onClose={closePanel}
      header={<ChatHeader title={chat?.title ?? t("scripts:chat.history.untitledChat")} onClose={closePanel} />}
    >
      <div className="relative">
        <div className="pb-40">
          <ChatMessageList
            chatUuid={activeChatUuid}
            scriptUuid={scriptUuid}
            onSuggestionClick={(suggestion) => sendMessage(suggestion, chat?.aiModel ?? AiModel.Claude)}
          />
        </div>
        <div className="sticky bottom-0 left-0 right-0 pointer-events-none">
          <div className="h-8 bg-linear-to-t from-clear to-transparent" />
          <div className="bg-clear pointer-events-auto px-2 pb-2">
            <ChatInput
              onSend={sendMessage}
              isPending={isCreatingChat || isSendingMessage}
              lockedAiModel={chat?.aiModel}
            />
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
