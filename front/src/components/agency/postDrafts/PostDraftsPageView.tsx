import { usePostDraftsStore } from "~/stores/postDrafts/postDraftsStore";
import PostDraftsLayout from "~/components/postDrafts/PostDraftsLayout";
import PostDraftDetailPanel from "./PostDraftDetailPanel";
import CreatePostDraftModal from "./CreatePostDraftModal";

interface PostDraftsPageViewProps {
    projectUuid: string;
}

export default function PostDraftsPageView({ projectUuid }: PostDraftsPageViewProps) {
    const selectedDraftUuid = usePostDraftsStore((s) => s.selectedDraftUuid);
    const isCreatePanelOpen = usePostDraftsStore((s) => s.isCreatePanelOpen);
    const openCreatePanel = usePostDraftsStore((s) => s.openCreatePanel);
    const closeCreatePanel = usePostDraftsStore((s) => s.closeCreatePanel);

    return (
        <>
            <PostDraftsLayout
                projectUuid={projectUuid}
                onCreateDraft={openCreatePanel}
                hasSelection={selectedDraftUuid !== null}
                detail={selectedDraftUuid && (
                    <PostDraftDetailPanel projectUuid={projectUuid} draftUuid={selectedDraftUuid} />
                )}
            />
            <CreatePostDraftModal
                projectUuid={projectUuid}
                showModal={isCreatePanelOpen}
                onClose={closeCreatePanel}
            />
        </>
    );
}
