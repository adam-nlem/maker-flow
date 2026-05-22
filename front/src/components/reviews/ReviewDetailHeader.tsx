import { useTranslation } from "react-i18next";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";
import { mediaTypeToIcon } from "~/models/enums/MediaType";
import type { ReviewEditForm } from "~/hooks/useReviewEditForm";
import { formatToRelative } from "~/utils/dateFormatters";

interface ReviewDetailHeaderProps {
    reviewDTO: ReviewWithLatestVersionDTO;
    form?: ReviewEditForm;
    onOpenLinkedScript?: (scriptUuid: string) => void;
}

export default function ReviewDetailHeader({
    reviewDTO,
    form,
    onOpenLinkedScript,
}: ReviewDetailHeaderProps) {
    const { t } = useTranslation();
    const MediaTypeIcon = mediaTypeToIcon[reviewDTO.review.mediaType];
    const typeLabel = t(`reviews:detail.eyebrow.${reviewDTO.review.mediaType}`);
    const relativeCreatedAt = formatToRelative(new Date(reviewDTO.review.createdAt));
    const showScriptLink = reviewDTO.review.script && onOpenLinkedScript && !form?.canEdit;

    return (
        <div className="flex flex-row items-center gap-2 text-body-xs uppercase tracking-wider text-muted-2 mb-5">
            <MediaTypeIcon className="size-3.5" />
            <span>{typeLabel}</span>
            <span aria-hidden className="text-pale-gray-2">·</span>
            <span>{relativeCreatedAt}</span>
            {showScriptLink && (
                <>
                    <span aria-hidden className="text-pale-gray-2">·</span>
                    <button
                        type="button"
                        onClick={() => onOpenLinkedScript!(reviewDTO.review.script!.uuid)}
                        className="uppercase tracking-wider hover:text-dark transition-colors cursor-pointer"
                    >
                        {t("reviews:detail.fromScript", { title: reviewDTO.review.script!.title })}
                    </button>
                </>
            )}
        </div>
    );
}
