import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import ReviewDetailPanel from "~/components/reviews/ReviewDetailPanel";
import LinkedScriptField from "~/components/agency/scripts/LinkedScriptField";
import { useShowReview } from "~/hooks/api/reviews/useShowReview";
import { useDeleteReview } from "~/hooks/api/reviews/useDeleteReview";
import { useReviewEditForm } from "~/hooks/useReviewEditForm";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { agencyScriptsPath } from "~/routes/routePaths";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";

interface AgencyReviewDetailPanelProps {
    projectUuid: string;
    draftUuid: string;
}

export default function AgencyReviewDetailPanel({ projectUuid, draftUuid }: AgencyReviewDetailPanelProps) {
    const { review: reviewDTO, isLoading } = useShowReview(draftUuid);

    if (isLoading || !reviewDTO) {
        return (
            <div className="mx-auto px-10 py-7 flex items-center justify-center h-64">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <LoadedAgencyReviewDetailPanel reviewDTO={reviewDTO} projectUuid={projectUuid} />;
}

interface LoadedAgencyReviewDetailPanelProps {
    reviewDTO: ReviewWithLatestVersionDTO;
    projectUuid: string;
}

function LoadedAgencyReviewDetailPanel({ reviewDTO, projectUuid }: LoadedAgencyReviewDetailPanelProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const closeAll = useReviewsStore((s) => s.closeAll);
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid);
    const form = useReviewEditForm(reviewDTO, projectUuid);
    const { deleteReview, isPending: isDeleting } = useDeleteReview();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const openLinkedScript = (scriptUuid: string) => {
        setFocusedScriptUuid(scriptUuid);
        navigate(agencyScriptsPath);
    };

    const handleDeleteConfirmed = async () => {
        await deleteReview({ uuid: reviewDTO.review.uuid, projectUuid });
        setIsDeleteDialogOpen(false);
        closeAll();
    };

    return (
        <ReviewDetailPanel
            reviewDTO={reviewDTO}
            projectUuid={projectUuid}
            form={form}
            onOpenLinkedScript={openLinkedScript}
            titleBarActions={(
                <Button type="button" style="secondary" width="w-auto" onClick={() => setIsDeleteDialogOpen(true)}>
                    <TrashIcon className="size-4 mr-1" strokeWidth={2} />
                    {t("reviews:actions.delete")}
                </Button>
            )}
            linkedScriptField={form.canEdit ? (
                <LinkedScriptField
                    projectUuid={projectUuid}
                    value={form.linkedScript}
                    onChange={form.setLinkedScript}
                />
            ) : undefined}
        >
            <ConfirmDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirmed}
                isPending={isDeleting}
                message={t("reviews:delete.confirmBody")}
            />
        </ReviewDetailPanel>
    );
}
