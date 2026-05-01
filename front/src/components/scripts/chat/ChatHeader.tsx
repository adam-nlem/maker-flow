import { ChatBubbleLeftRightIcon, ClockIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { useChatStore } from "~/stores/scripts/chatStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";

interface ChatHeaderProps {
  title: string;
  onClose: () => void;
}

export function ChatHeader({ title, onClose }: ChatHeaderProps) {
  const { t } = useTranslation();
  const openPanel = useScriptRightPanelStore((s) => s.openPanel);
  const setActiveChatUuid = useChatStore((s) => s.setActiveChatUuid);

  const handleOpenHistory = () => openPanel(ScriptRightPanel.ChatHistory);
  const handleCreateChat = () => setActiveChatUuid(null);

  return (
    <div className="flex flex-row items-center justify-between px-4 py-4 border-b border-light-gray">
      <div className="flex flex-row items-center gap-2">
        <ChatBubbleLeftRightIcon className="size-5 text-primary" strokeWidth={2} />
        <h2 className="text-heading-md">{title}</h2>
      </div>
      <div className="flex flex-row items-center gap-3 text-gray">
        <button onClick={handleOpenHistory} className="shrink-0 hover:text-dark transition-colors cursor-pointer" title={t("scripts:chat.header.openHistory")}>
          <ClockIcon className="size-4" strokeWidth={2} />
        </button>
        <button onClick={handleCreateChat} className="shrink-0 hover:text-dark transition-colors cursor-pointer" title={t("scripts:chat.header.newConversation")}>
          <PlusIcon className="size-4" strokeWidth={2} />
        </button>
        <button onClick={onClose} className="shrink-0 hover:text-dark transition-colors cursor-pointer" title={t("actions.close")}>
          <XMarkIcon className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
