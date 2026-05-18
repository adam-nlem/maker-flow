import { useRef, useState } from "react";
import { ClockIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { SidePanel } from "~/components/ui/SidePanel";
import Shimmer from "~/components/ui/Shimmer";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { useChatStore } from "~/stores/scripts/chatStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";
import { useListPaginatedChats } from "~/hooks/api/chats/useListPaginatedChats";
import { useDeleteChat } from "~/hooks/api/chats/useDeleteChat";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { aiModelTranslationKeys, aiModelToIcon } from "~/models/enums/AiModel";
import { formatToRelative } from "~/utils/dateFormatters";

interface ChatHistoryPanelProps {
  scriptUuid: string;
}

export default function ChatHistoryPanel({ scriptUuid }: ChatHistoryPanelProps) {
  const { t } = useTranslation();
  const isOpen = useScriptRightPanelStore((s) => s.activePanel === ScriptRightPanel.ChatHistory);
  const closePanel = useScriptRightPanelStore((s) => s.closePanel);
  const openPanel = useScriptRightPanelStore((s) => s.openPanel);
  const activeChatUuid = useChatStore((s) => s.activeChatUuid);
  const setActiveChatUuid = useChatStore((s) => s.setActiveChatUuid);

  const { chats, isLoading, hasMore, isLoadingMore, listMore } = useListPaginatedChats({ scriptUuid });
  const { deleteChat, isPending: isDeleting } = useDeleteChat();

  const [pendingDeleteUuid, setPendingDeleteUuid] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useInfiniteScroll(scrollContainerRef, hasMore, isLoadingMore, listMore);

  const handleSelectChat = (chatUuid: string) => {
    setActiveChatUuid(chatUuid);
    openPanel(ScriptRightPanel.Chat);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteUuid) return;
    if (activeChatUuid === pendingDeleteUuid) {
      setActiveChatUuid(null);
    }
    await deleteChat({ chatUuid: pendingDeleteUuid, scriptUuid });
    setPendingDeleteUuid(null);
  };

  return (
    <>
      <SidePanel
        title={t("scripts:chat.history.title")}
        icon={ClockIcon}
        width="w-120"
        isOpen={isOpen}
        onClose={closePanel}
        bodyRef={scrollContainerRef}
      >
        <div className="p-3 flex flex-col gap-2">
          {isLoading ? (
            <>
              <Shimmer height="h-14" width="w-full" />
              <Shimmer height="h-14" width="w-full" />
              <Shimmer height="h-14" width="w-full" />
            </>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-2">
              <p className="text-body-sm text-center">{t("scripts:chat.history.empty")}</p>
            </div>
          ) : (
            <>
              {chats.map((chat) => (
                <div
                  key={chat.uuid}
                  onClick={() => handleSelectChat(chat.uuid)}
                  className={`group flex flex-row items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                    activeChatUuid === chat.uuid
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-surface-hover border border-transparent"
                  }`}
                >
                  <img
                    src={aiModelToIcon[chat.aiModel]}
                    alt={t(aiModelTranslationKeys[chat.aiModel])}
                    className="size-5 shrink-0 rounded-md object-cover"
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-body-sm text-dark truncate">
                      {chat.title ?? t("scripts:chat.history.untitledChat")}
                    </p>
                    <p className="text-body-xs text-muted-2">
                      {t(aiModelTranslationKeys[chat.aiModel])} · {formatToRelative(chat.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDeleteUuid(chat.uuid);
                    }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-2 hover:text-danger cursor-pointer"
                    title={t("scripts:chat.history.deleteTitle")}
                  >
                    <TrashIcon className="size-4" strokeWidth={2} />
                  </button>
                </div>
              ))}
              {isLoadingMore && <Shimmer height="h-14" width="w-full" />}
            </>
          )}
        </div>
      </SidePanel>

      <ConfirmDeleteDialog
        isOpen={!!pendingDeleteUuid}
        onClose={() => setPendingDeleteUuid(null)}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
        message={t("scripts:chat.history.deleteConfirm")}
      />
    </>
  );
}
