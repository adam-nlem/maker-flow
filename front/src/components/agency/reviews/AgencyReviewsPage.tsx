import ReviewsLayout from "~/components/reviews/ReviewsLayout";
import AgencyReviewDetailPanel from "./AgencyReviewDetailPanel";
import CreateReviewModal from "./CreateReviewModal";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";

interface AgencyReviewsPageProps {
    projectUuid: string;
}

export default function AgencyReviewsPage({ projectUuid }: AgencyReviewsPageProps) {
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
                    <AgencyReviewDetailPanel projectUuid={projectUuid} draftUuid={selectedReviewUuid} />
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
