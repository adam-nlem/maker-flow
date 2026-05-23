import { useState } from "react";
import { useTranslation } from "react-i18next";
import ReviewDetailPanel from "~/components/reviews/ReviewDetailPanel";
import ClientReviewActionsBar from "./ClientReviewActionsBar";
import ClientReviewRequestChangesModal from "./ClientReviewRequestChangesModal";
import { useShowReview } from "~/hooks/api/reviews/useShowReview";
import { useApproveReviewVersion } from "~/hooks/api/reviews/useApproveReviewVersion";
import { useToastStore } from "~/stores/toast/toastStore";
import { ToastType } from "~/models/enums/ToastType";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";
import { ReviewStatus } from "~/models/enums/ReviewStatus";

interface ClientReviewDetailPanelProps {
    projectUuid: string;
    draftUuid: string;
}

export default function ClientReviewDetailPanel({ projectUuid, draftUuid }: ClientReviewDetailPanelProps) {
    const { review: reviewDTO, isLoading } = useShowReview(draftUuid);

    if (isLoading || !reviewDTO) {
        return (
            <div className="mx-auto px-10 py-7 flex items-center justify-center h-64">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <LoadedClientReviewDetailPanel reviewDTO={reviewDTO} projectUuid={projectUuid} />;
}

interface LoadedClientReviewDetailPanelProps {
    reviewDTO: ReviewWithLatestVersionDTO;
    projectUuid: string;
}

function LoadedClientReviewDetailPanel({ reviewDTO, projectUuid }: LoadedClientReviewDetailPanelProps) {
    const { t } = useTranslation();
    const addToast = useToastStore((s) => s.addToast);
    const { approveReviewVersion, isPending: isApproving } = useApproveReviewVersion();

    const [isRequestChangesModalOpen, setIsRequestChangesModalOpen] = useState(false);
    const [approveError, setApproveError] = useState<string | null>(null);

    const status = reviewDTO.currentStatus ?? ReviewStatus.Pending;

    const handleApprove = async () => {
        if (!reviewDTO.latestVersion) return;
        setApproveError(null);
        try {
            await approveReviewVersion({
                reviewVersionUuid: reviewDTO.latestVersion.uuid,
                reviewUuid: reviewDTO.review.uuid,
                projectUuid,
            });
            addToast(ToastType.Success, t("clientReviews:toast.approveSuccess"));
        } catch {
            setApproveError(t("clientReviews:toast.approveError"));
            addToast(ToastType.Error, t("clientReviews:toast.approveError"));
        }
    };

    return (
        <ReviewDetailPanel
            reviewDTO={reviewDTO}
            projectUuid={projectUuid}
            footer={({ isLatest }) => isLatest ? (
                <ClientReviewActionsBar
                    status={status}
                    isApproving={isApproving}
                    approveError={approveError}
                    onApprove={handleApprove}
                    onRequestChanges={() => setIsRequestChangesModalOpen(true)}
                />
            ) : null}
        >
            {reviewDTO.latestVersion && (
                <ClientReviewRequestChangesModal
                    isOpen={isRequestChangesModalOpen}
                    onClose={() => setIsRequestChangesModalOpen(false)}
                    reviewVersionUuid={reviewDTO.latestVersion.uuid}
                    reviewUuid={reviewDTO.review.uuid}
                    projectUuid={projectUuid}
                />
            )}
        </ReviewDetailPanel>
    );
}
