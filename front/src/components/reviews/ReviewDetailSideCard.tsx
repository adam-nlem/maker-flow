import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "~/components/ui/Tag";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";
import { mediaTypeToIcon } from "~/models/enums/MediaType";
import {
    ReviewStatus,
    reviewStatusToBgClass,
    reviewStatusToIcon,
    reviewStatusToTextClass,
    reviewStatusTranslationKeys,
} from "~/models/enums/ReviewStatus";
import { formatToFrenchDateShort } from "~/utils/dateFormatters";

interface ReviewDetailSideCardProps {
    reviewDTO: ReviewWithLatestVersionDTO;
    onLinkedScriptClick?: () => void;
}

export default function ReviewDetailSideCard({ reviewDTO, onLinkedScriptClick }: ReviewDetailSideCardProps) {
    const { t } = useTranslation();
    const MediaTypeIcon = mediaTypeToIcon[reviewDTO.review.mediaType];
    const typeLabel = t(`reviews:detail.eyebrow.${reviewDTO.review.mediaType}`);
    const status = reviewDTO.currentStatus ?? ReviewStatus.Pending;

    return (
        <aside className="bg-clear-2 border border-pale-gray rounded-xl p-1 self-start w-1/3">
            <SideCardRow label={t("reviews:detail.sideCard.type")}>
                <MediaTypeIcon className="size-3.5 text-muted" />
                <span>{typeLabel}</span>
            </SideCardRow>
            <SideCardRow label={t("reviews:detail.sideCard.status")}>
                <Tag
                    icon={reviewStatusToIcon[status]}
                    label={t(reviewStatusTranslationKeys[status])}
                    bgClassName={reviewStatusToBgClass[status]}
                    textClassName={reviewStatusToTextClass[status]}
                />
            </SideCardRow>
            {reviewDTO.review.script && onLinkedScriptClick && (
                <SideCardRow label={t("reviews:detail.sideCard.linkedScript")}>
                    <button
                        type="button"
                        onClick={onLinkedScriptClick}
                        className="text-left hover:text-primary transition-colors cursor-pointer"
                    >
                        {reviewDTO.review.script.title}
                    </button>
                </SideCardRow>
            )}
            <SideCardRow label={t("reviews:detail.sideCard.uploaded")}>
                {formatToFrenchDateShort(new Date(reviewDTO.review.createdAt))}
            </SideCardRow>
            {reviewDTO.review.updatedAt !== null && reviewDTO.review.updatedAt !== reviewDTO.review.createdAt && (
                <SideCardRow label={t("reviews:detail.sideCard.updated")}>
                    {formatToFrenchDateShort(new Date(reviewDTO.review.updatedAt))}
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
