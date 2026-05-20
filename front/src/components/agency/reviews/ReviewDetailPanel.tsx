import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Banner } from "~/components/ui/Banner";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import PostDraftMediaViewer from "~/components/postDrafts/PostDraftMediaViewer";
import PostDraftCommentsTimeline from "~/components/postDrafts/PostDraftCommentsTimeline";
import PostDraftDetailHeader from "./PostDraftDetailHeader";
import PostDraftDetailBody from "./PostDraftDetailBody";
import PostDraftDetailSideCard from "./PostDraftDetailSideCard";
import { useShowPostDraft } from "~/hooks/api/postDrafts/useShowPostDraft";
import { useDeletePostDraft } from "~/hooks/api/postDrafts/useDeletePostDraft";
import { usePostDraftEditForm } from "~/hooks/usePostDraftEditForm";
import { usePostDraftsStore } from "~/stores/postDrafts/postDraftsStore";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { agencyScriptsPath } from "~/routes/routePaths";
import { PostDraft } from "~/models/PostDraft";
import {
    PostDraftStatus,
    postDraftStatusToBannerSubtitleKey,
    postDraftStatusToBannerTitleKey,
    postDraftStatusToBgClass,
    postDraftStatusToBorderClass,
    postDraftStatusToIcon,
    postDraftStatusToTextClass,
} from "~/models/enums/PostDraftStatus";

interface PostDraftDetailPanelProps {
    projectUuid: string;
    draftUuid: string;
}

export default function PostDraftDetailPanel({ projectUuid, draftUuid }: PostDraftDetailPanelProps) {
    const { postDraft, isLoading } = useShowPostDraft(draftUuid);

    if (isLoading || !postDraft) {
        return (
            <div className="mx-auto px-10 py-7 flex items-center justify-center h-64">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <LoadedPostDraftDetailPanel postDraft={postDraft} projectUuid={projectUuid} />;
}

interface LoadedPostDraftDetailPanelProps {
    postDraft: PostDraft;
    projectUuid: string;
}

function LoadedPostDraftDetailPanel({ postDraft, projectUuid }: LoadedPostDraftDetailPanelProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const closeAll = usePostDraftsStore((s) => s.closeAll);
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid);
    const form = usePostDraftEditForm(postDraft, projectUuid);
    const { deletePostDraft, isPending: isDeleting } = useDeletePostDraft();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const openLinkedScript = (scriptUuid: string) => {
        setFocusedScriptUuid(scriptUuid);
        navigate(agencyScriptsPath);
    };

    const handleDeleteConfirmed = async () => {
        await deletePostDraft({ uuid: postDraft.uuid, projectUuid });
        setIsDeleteDialogOpen(false);
        closeAll();
    };

    const status = postDraft.currentStatus ?? PostDraftStatus.AwaitingReview;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                void form.submit();
            }}
            className="mx-auto px-10 py-7 pb-24"
        >
            <Banner
                className="mb-6"
                icon={postDraftStatusToIcon[status]}
                title={t(postDraftStatusToBannerTitleKey[status])}
                subtitle={t(postDraftStatusToBannerSubtitleKey[status])}
                bgClassName={postDraftStatusToBgClass[status]}
                textClassName={postDraftStatusToTextClass[status]}
                borderClassName={postDraftStatusToBorderClass[status]}
            />

            <PostDraftDetailHeader
                postDraft={postDraft}
                form={form}
                onOpenLinkedScript={openLinkedScript}
                onDeleteClick={() => setIsDeleteDialogOpen(true)}
            />

            {postDraft.latestMediaVersion && (
                <PostDraftMediaViewer mediaVersion={postDraft.latestMediaVersion} mediaType={postDraft.mediaType} />
            )}

            <div className="flex flex-row gap-3 mt-3.5">
                <PostDraftDetailBody postDraft={postDraft} projectUuid={projectUuid} form={form} />
                <PostDraftDetailSideCard
                    postDraft={postDraft}
                    onLinkedScriptClick={form.canEdit ? undefined : () => openLinkedScript(postDraft.script!.uuid)}
                />
            </div>

            <PostDraftCommentsTimeline postDraft={postDraft} projectUuid={projectUuid} />

            <ConfirmDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirmed}
                isPending={isDeleting}
                message={t("postDrafts:delete.confirmBody")}
            />
        </form>
    );
}
