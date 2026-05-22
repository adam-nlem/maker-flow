import ReviewsLayout from "~/components/reviews/ReviewsLayout";
import ClientReviewDetailPanel from "./ClientReviewDetailPanel";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";

interface ClientReviewsPageProps {
    projectUuid: string;
}

export default function ClientReviewsPage({ projectUuid }: ClientReviewsPageProps) {
    const selectedReviewUuid = useReviewsStore((s) => s.selectedReviewUuid);

    return (
        <ReviewsLayout
            projectUuid={projectUuid}
            hasSelection={selectedReviewUuid !== null}
            detail={selectedReviewUuid && (
                <ClientReviewDetailPanel projectUuid={projectUuid} draftUuid={selectedReviewUuid} />
            )}
        />
    );
}
