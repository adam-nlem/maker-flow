import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "~/components/ui/Tag";
import { PostDraft } from "~/models/PostDraft";
import { mediaTypeToIcon } from "~/models/enums/MediaType";
import {
    PostDraftStatus,
    postDraftStatusToBgClass,
    postDraftStatusToIcon,
    postDraftStatusToTextClass,
    postDraftStatusTranslationKeys,
} from "~/models/enums/PostDraftStatus";
import { formatToFrenchDateShort } from "~/utils/dateFormatters";

interface PostDraftDetailSideCardProps {
    postDraft: PostDraft;
    onLinkedScriptClick?: () => void;
}

export default function PostDraftDetailSideCard({ postDraft, onLinkedScriptClick }: PostDraftDetailSideCardProps) {
    const { t } = useTranslation();
    const MediaTypeIcon = mediaTypeToIcon[postDraft.mediaType];
    const typeLabel = t(`postDrafts:detail.eyebrow.${postDraft.mediaType}`);
    const status = postDraft.currentStatus ?? PostDraftStatus.AwaitingReview;

    return (
        <aside className="bg-clear-2 border border-pale-gray rounded-xl p-1 self-start w-1/3">
            <SideCardRow label={t("postDrafts:detail.sideCard.type")}>
                <MediaTypeIcon className="size-3.5 text-muted" />
                <span>{typeLabel}</span>
            </SideCardRow>
            <SideCardRow label={t("postDrafts:detail.sideCard.status")}>
                <Tag
                    icon={postDraftStatusToIcon[status]}
                    label={t(postDraftStatusTranslationKeys[status])}
                    bgClassName={postDraftStatusToBgClass[status]}
                    textClassName={postDraftStatusToTextClass[status]}
                />
            </SideCardRow>
            {postDraft.script && onLinkedScriptClick && (
                <SideCardRow label={t("postDrafts:detail.sideCard.linkedScript")}>
                    <button
                        type="button"
                        onClick={onLinkedScriptClick}
                        className="text-left hover:text-primary transition-colors cursor-pointer"
                    >
                        {postDraft.script.title}
                    </button>
                </SideCardRow>
            )}
            <SideCardRow label={t("postDrafts:detail.sideCard.uploaded")}>
                {formatToFrenchDateShort(new Date(postDraft.createdAt))}
            </SideCardRow>
            {postDraft.updatedAt !== postDraft.createdAt && (
                <SideCardRow label={t("postDrafts:detail.sideCard.updated")}>
                    {formatToFrenchDateShort(new Date(postDraft.updatedAt))}
                </SideCardRow>
            )}
        </aside>
    );
}

function SideCardRow({ label, children }: { label: string; children: ReactNode }) {
    return (    
        <div className="flex items-start gap-2.5 px-3 py-2.5 border-b border-pale-gray last:border-b-0">
            <span className="min-w-19 uppercase text-body-xs tracking-wider text-muted">{label}</span>
            <div className="flex-1 text-body-sm text-dark-2 flex items-center gap-1.5 flex-wrap">
                {children}
            </div>
        </div>
    );
}
