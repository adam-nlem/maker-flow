import { useRef, useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import Pill from "~/components/ui/Pill";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { useListPaginatedChats } from "~/hooks/api/chats/useListPaginatedChats";
import { useCreateChat } from "~/hooks/api/chats/useCreateChat";
import { useDeleteChat } from "~/hooks/api/chats/useDeleteChat";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { useChatStore } from "~/stores/scripts/chatStore";
import { type AiModel, aiModelOptions, aiModelTranslationKeys, aiModelToIcon } from "~/models/enums/AiModel";
import { formatToFrenchRelative } from "~/utils/dateFormatters";

interface ChatHistoryBarProps {
    scriptUuid: string;
    projectUuid: string;
}

export default function ChatHistoryBar({ scriptUuid }: ChatHistoryBarProps) {
    const { t } = useTranslation();
    const { chats, hasMore, isLoadingMore, listMore } = useListPaginatedChats({ scriptUuid });
    const { createChat, isPending: isCreatingChat } = useCreateChat();
    const { deleteChat } = useDeleteChat();

    const activeChatUuid = useChatStore((s) => s.activeChatUuid);
    const setActiveChatUuid = useChatStore((s) => s.setActiveChatUuid);
    const isCreatingMode = useChatStore((s) => s.isCreatingChat);
    const setIsCreatingChat = useChatStore((s) => s.setIsCreatingChat);

    const [pendingDeleteUuid, setPendingDeleteUuid] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useInfiniteScroll(containerRef, hasMore, isLoadingMore, listMore, { direction: "horizontal" });

    const handleCreateChat = async (aiModel: AiModel) => {
        const chat = await createChat({ scriptUuid, aiModel });
        setActiveChatUuid(chat.uuid);
        setIsCreatingChat(false);
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
            <div className="shrink-0 flex flex-col gap-2 px-4 py-2">
                <div ref={containerRef} className="flex flex-row items-center gap-2 overflow-x-auto scrollbar-none">
                    <Pill
                        icon={PlusIcon}
                        label={t("scripts:chat.bar.newChat")}
                        onClick={() => setIsCreatingChat(true)}
                    />
                    {chats.map((chat) => (
                        <Pill
                            key={chat.uuid}
                            imageUrl={aiModelToIcon[chat.aiModel]}
                            label={`${t(aiModelTranslationKeys[chat.aiModel])} - ${formatToFrenchRelative(chat.createdAt)}`}
                            isSelected={activeChatUuid === chat.uuid}
                            bgColorClassName="bg-primary/10"
                            borderColorClassName="border border-primary/30"
                            suffixIcon={XMarkIcon}
                            onClick={() => setActiveChatUuid(chat.uuid)}
                            onSuffixClick={() => setPendingDeleteUuid(chat.uuid)}
                        />
                    ))}
                </div>

                {isCreatingMode && (
                    <div className="flex flex-row items-center gap-2">
                        {aiModelOptions.map((model) => (
                            <Pill
                                key={model}
                                imageUrl={aiModelToIcon[model]}
                                label={t(aiModelTranslationKeys[model])}
                                onClick={() => handleCreateChat(model)}
                                isSelected={isCreatingChat}
                                borderColorClassName="border-pale-gray"
                            />
                        ))}
                        <SimpleTextButton onClick={() => setIsCreatingChat(false)}>
                            {t("actions.cancel")}
                        </SimpleTextButton>
                    </div>
                )}
            </div>

            <ConfirmDeleteDialog
                isOpen={!!pendingDeleteUuid}
                onClose={() => setPendingDeleteUuid(null)}
                onConfirm={handleConfirmDelete}
                message={t("scripts:chat.history.deleteConfirm")}
            />
        </>
    );
}
