import { useTranslation } from "react-i18next";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { usePostDraftsStore } from "~/stores/postDrafts/postDraftsStore";
import PostDraftsList from "./PostDraftsList";
import PostDraftDetailPanel from "./PostDraftDetailPanel";
import CreatePostDraftModal from "./CreatePostDraftModal";

interface PostDraftsPageViewProps {
    projectUuid: string;
}

export default function PostDraftsPageView({ projectUuid }: PostDraftsPageViewProps) {
    const { t } = useTranslation();
    const selectedDraftUuid = usePostDraftsStore((s) => s.selectedDraftUuid);
    const isCreatePanelOpen = usePostDraftsStore((s) => s.isCreatePanelOpen);
    const closeCreatePanel = usePostDraftsStore((s) => s.closeCreatePanel);

    return (
        <div className="flex flex-row h-full overflow-hidden">
            <aside className="w-75 shrink-0 border-r border-pale-gray overflow-y-auto">
                <PostDraftsList projectUuid={projectUuid} />
            </aside>

            <main className="flex-1 min-w-0 overflow-y-auto">
                {selectedDraftUuid ? (
                    <PostDraftDetailPanel projectUuid={projectUuid} draftUuid={selectedDraftUuid} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                        <DocumentDuplicateIcon className="size-12 text-muted-2" />
                        <h2 className="text-heading-md text-dark">{t("postDrafts:emptyState.noSelection.title")}</h2>
                        <p className="text-body-sm text-muted-2 max-w-sm">{t("postDrafts:emptyState.noSelection.subtitle")}</p>
                    </div>
                )}
            </main>

            <CreatePostDraftModal
                projectUuid={projectUuid}
                showModal={isCreatePanelOpen}
                onClose={closeCreatePanel}
            />
        </div>
    );
}
