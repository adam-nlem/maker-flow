import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { ReviewStatus } from "~/models/enums/ReviewStatus";

interface ClientReviewActionsBarProps {
    status: ReviewStatus;
    isApproving: boolean;
    approveError: string | null;
    onApprove: () => void;
}

export default function ClientReviewActionsBar({
    status,
    isApproving,
    approveError,
    onApprove,
}: ClientReviewActionsBarProps) {
    const { t } = useTranslation();

    if (status !== ReviewStatus.Pending) {
        return null;
    }

    return (
        <div className="mt-6">
            <Button
                type="button"
                style="primary"
                width="w-auto"
                onClick={onApprove}
                isLoading={isApproving}
                disabled={isApproving}
            >
                <CheckCircleIcon className="size-4 mr-1" strokeWidth={2} />
                {t("clientReviews:actions.approve")}
            </Button>
            {approveError && (
                <p className="text-body-xs text-danger mt-2">{approveError}</p>
            )}
        </div>
    );
}
