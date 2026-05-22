import { useTranslation } from "react-i18next";
import { CheckCircleIcon, ChatBubbleLeftRightIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { ReviewStatus } from "~/models/enums/ReviewStatus";

interface ClientReviewActionsBarProps {
    status: ReviewStatus;
    isApproving: boolean;
    approveError: string | null;
    onApprove: () => void;
    onRequestChanges: () => void;
}

export default function ClientReviewActionsBar({
    status,
    isApproving,
    approveError,
    onApprove,
    onRequestChanges,
}: ClientReviewActionsBarProps) {
    const { t } = useTranslation();

    if (status === ReviewStatus.ChangesRequested) {
        return (
            <div className="mt-6 flex flex-row items-center gap-2 text-body-sm text-muted-2 bg-clear-2 border border-pale-gray rounded-xl px-4 py-3">
                <ClockIcon className="size-4 shrink-0" />
                <span>{t("clientReviews:actions.waitingForAgency")}</span>
            </div>
        );
    }

    if (status === ReviewStatus.Rejected) {
        return null;
    }

    return (
        <div className="mt-6">
            <div className="flex flex-row flex-wrap gap-2">
                {status === ReviewStatus.Pending && (
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
                )}
                <Button
                    type="button"
                    style="secondary"
                    width="w-auto"
                    onClick={onRequestChanges}
                    disabled={isApproving}
                >
                    <ChatBubbleLeftRightIcon className="size-4 mr-1" strokeWidth={2} />
                    {t("clientReviews:actions.requestChanges")}
                </Button>
            </div>
            {approveError && (
                <p className="text-body-xs text-danger mt-2">{approveError}</p>
            )}
        </div>
    );
}
