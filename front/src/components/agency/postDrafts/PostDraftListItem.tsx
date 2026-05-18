import { useTranslation } from "react-i18next";
import { Tag } from "~/components/ui/Tag";
import type { PostDraft } from "~/models/PostDraft";
import { MediaType, mediaTypeToIcon, mediaTypeTranslationKeys } from "~/models/enums/MediaType";
import { postDraftStatusToBgClass, postDraftStatusToIcon, postDraftStatusToTextClass, postDraftStatusTranslationKeys } from "~/models/enums/PostDraftStatus";
import { formatToRelative } from "~/utils/dateFormatters";

interface PostDraftListItemProps {
    postDraft: PostDraft;
    isSelected: boolean;
    onSelect: () => void;
}



export default function PostDraftListItem({ postDraft, isSelected, onSelect }: PostDraftListItemProps) {
    const { t } = useTranslation();
    const latest = postDraft.latestRevision;
    const Icon = mediaTypeToIcon[postDraft.mediaType];


    return (
        <div

            onClick={onSelect}
            className={`w-full text-left flex gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer ${isSelected
                    ? "bg-clear-2 border-pale-gray"
                    : "border-transparent hover:bg-clear-2"
                }`}
        >
            <div className="size-16 shrink-0 rounded-lg bg-clear-3 overflow-hidden relative">
            
                <div className="absolute bottom-1 right-1 size-4.5 rounded bg-dark/65 flex items-center justify-center">
                    <Icon className="size-3 text-clear" strokeWidth={2} />
                </div>

                {postDraft.mediaType === MediaType.Carousel && latest && (
                    <div className="absolute top-1 right-1 px-1 rounded bg-dark/60 text-clear text-xs">
                        1/{latest.fileCount}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <p className="text-heading-sm text-dark truncate">{postDraft.title}</p>
                <div className="flex items-center gap-1.5 text-body-xs text-muted-2">
                    <span>{t(mediaTypeTranslationKeys[postDraft.mediaType])}</span>
                    <span>·</span>
                    <span>{formatToRelative(new Date(postDraft.updatedAt))}</span>
                </div>
                <Tag
                    icon={postDraftStatusToIcon[postDraft.status]}
                    label={t(postDraftStatusTranslationKeys[postDraft.status])}
                    bgClassName={postDraftStatusToBgClass[postDraft.status]}
                    textClassName={postDraftStatusToTextClass[postDraft.status]}
                />
            </div>
        </div>
    );
}
