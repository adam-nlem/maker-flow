import { useTranslation } from "react-i18next";
import { Tag } from "~/components/ui/Tag";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";
import { MediaType, mediaTypeToIcon, mediaTypeTranslationKeys } from "~/models/enums/MediaType";
import { ReviewStatus, reviewStatusToBgClass, reviewStatusToIcon, reviewStatusToTextClass, reviewStatusTranslationKeys } from "~/models/enums/ReviewStatus";
import { formatToRelative } from "~/utils/dateFormatters";

interface ReviewTileProps {
    reviewDTO: ReviewWithLatestVersionDTO;
    isSelected: boolean;
    onSelect: () => void;
}

export default function ReviewTile({ reviewDTO, isSelected, onSelect }: ReviewTileProps) {
    const { t } = useTranslation();
    const Icon = mediaTypeToIcon[reviewDTO.review.mediaType];
    const status = reviewDTO.currentStatus ?? ReviewStatus.Pending;

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

                {reviewDTO.review.mediaType === MediaType.Carousel && reviewDTO.latestVersion && (
                    <div className="absolute top-1 right-1 px-1 rounded bg-dark/60 text-clear text-xs">
                        1/{reviewDTO.latestVersion.fileCount}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <p className="text-heading-sm text-dark truncate">{reviewDTO.review.title}</p>
                <div className="flex items-center gap-1.5 text-body-xs text-muted-2">
                    <span>{t(mediaTypeTranslationKeys[reviewDTO.review.mediaType])}</span>
                    <span>·</span>
                    <span>{formatToRelative(new Date(reviewDTO.review.createdAt))}</span>
                </div>
                <Tag
                    icon={reviewStatusToIcon[status]}
                    label={t(reviewStatusTranslationKeys[status])}
                    bgClassName={reviewStatusToBgClass[status]}
                    textClassName={reviewStatusToTextClass[status]}
                />
            </div>
        </div>
    );
}
