import { useReviewsStore } from "~/stores/reviews/reviewsStore";
import ReviewsLayout from "~/components/reviews/ReviewsLayout";
import ReviewDetailPanel from "./ReviewDetailPanel";
import CreateReviewModal from "./CreateReviewModal";

interface ReviewsPageViewProps {
    projectUuid: string;
}

export default function ReviewsPageView({ projectUuid }: ReviewsPageViewProps) {
    const selectedReviewUuid = useReviewsStore((s) => s.selectedReviewUuid);
    const isCreatePanelOpen = useReviewsStore((s) => s.isCreatePanelOpen);
    const openCreatePanel = useReviewsStore((s) => s.openCreatePanel);
    const closeCreatePanel = useReviewsStore((s) => s.closeCreatePanel);

    return (
        <>
            <ReviewsLayout
                projectUuid={projectUuid}
                onCreateReview={openCreatePanel}
                hasSelection={selectedReviewUuid !== null}
                detail={selectedReviewUuid && (
                    <ReviewDetailPanel projectUuid={projectUuid} draftUuid={selectedReviewUuid} />
                )}
            />
            <CreateReviewModal
                projectUuid={projectUuid}
                showModal={isCreatePanelOpen}
                onClose={closeCreatePanel}
            />
        </>
    );
}
