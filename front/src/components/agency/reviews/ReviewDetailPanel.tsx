import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Banner } from "~/components/ui/Banner";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import ReviewMediaViewer from "~/components/reviews/ReviewMediaViewer";
import ReviewCommentsTimeline from "~/components/reviews/ReviewCommentsTimeline";
import ReviewDetailHeader from "./ReviewDetailHeader";
import ReviewDetailBody from "./ReviewDetailBody";
import ReviewDetailSideCard from "./ReviewDetailSideCard";
import { useShowReview } from "~/hooks/api/reviews/useShowReview";
import { useDeleteReview } from "~/hooks/api/reviews/useDeleteReview";
import { useReviewEditForm } from "~/hooks/useReviewEditForm";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { agencyScriptsPath } from "~/routes/routePaths";
import { Review } from "~/models/Review";
import {
    ReviewStatus,
    reviewStatusToBannerSubtitleKey,
    reviewStatusToBannerTitleKey,
    reviewStatusToBgClass,
    reviewStatusToBorderClass,
    reviewStatusToIcon,
    reviewStatusToTextClass,
} from "~/models/enums/ReviewStatus";

interface ReviewDetailPanelProps {
    projectUuid: string;
    draftUuid: string;
}

export default function ReviewDetailPanel({ projectUuid, draftUuid }: ReviewDetailPanelProps) {
    const { review, isLoading } = useShowReview(draftUuid);

    if (isLoading || !review) {
        return (
            <div className="mx-auto px-10 py-7 flex items-center justify-center h-64">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <LoadedReviewDetailPanel review={review} projectUuid={projectUuid} />;
}

interface LoadedReviewDetailPanelProps {
    review: Review;
    projectUuid: string;
}

function LoadedReviewDetailPanel({ review, projectUuid }: LoadedReviewDetailPanelProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const closeAll = useReviewsStore((s) => s.closeAll);
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid);
    const form = useReviewEditForm(review, projectUuid);
    const { deleteReview, isPending: isDeleting } = useDeleteReview();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const openLinkedScript = (scriptUuid: string) => {
        setFocusedScriptUuid(scriptUuid);
        navigate(agencyScriptsPath);
    };

    const handleDeleteConfirmed = async () => {
        await deleteReview({ uuid: review.uuid, projectUuid });
        setIsDeleteDialogOpen(false);
        closeAll();
    };

    const status = review.currentStatus ?? ReviewStatus.Pending;
    const videoElementRef = useRef<HTMLVideoElement>(null);

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
                icon={reviewStatusToIcon[status]}
                title={t(reviewStatusToBannerTitleKey[status])}
                subtitle={t(reviewStatusToBannerSubtitleKey[status])}
                bgClassName={reviewStatusToBgClass[status]}
                textClassName={reviewStatusToTextClass[status]}
                borderClassName={reviewStatusToBorderClass[status]}
            />

            <ReviewDetailHeader
                review={review}
                form={form}
                onOpenLinkedScript={openLinkedScript}
                onDeleteClick={() => setIsDeleteDialogOpen(true)}
            />

            {review.latestVersion && (
                <ReviewMediaViewer
                    reviewVersion={review.latestVersion}
                    mediaType={review.mediaType}
                    videoElementRef={videoElementRef}
                />
            )}

            <div className="flex flex-row gap-3 mt-3.5">
                <ReviewDetailBody review={review} projectUuid={projectUuid} form={form} />
                <ReviewDetailSideCard
                    review={review}
                    onLinkedScriptClick={form.canEdit ? undefined : () => openLinkedScript(review.script!.uuid)}
                />
            </div>

            <ReviewCommentsTimeline review={review} projectUuid={projectUuid} videoElementRef={videoElementRef} />

            <ConfirmDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirmed}
                isPending={isDeleting}
                message={t("reviews:delete.confirmBody")}
            />
        </form>
    );
}
