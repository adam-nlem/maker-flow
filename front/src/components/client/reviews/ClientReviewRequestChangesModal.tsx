import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ModalOverlay from "~/components/ui/ModalOverlay";
import { Button } from "~/components/ui/Button";
import { TextArea } from "~/components/ui/TextArea";
import { useRequestChangesOnReviewVersion } from "~/hooks/api/reviews/useRequestChangesOnReviewVersion";
import { useToastStore } from "~/stores/toast/toastStore";
import { ToastType } from "~/models/enums/ToastType";

const MAX_BODY_LENGTH = 5000;

interface ClientReviewRequestChangesModalProps {
    isOpen: boolean;
    onClose: () => void;
    reviewVersionUuid: string;
    reviewUuid: string;
    projectUuid: string;
}

export default function ClientReviewRequestChangesModal({
    isOpen,
    onClose,
    reviewVersionUuid,
    reviewUuid,
    projectUuid,
}: ClientReviewRequestChangesModalProps) {
    const { t } = useTranslation();
    const addToast = useToastStore((s) => s.addToast);
    const { requestChangesOnReviewVersion, isPending } = useRequestChangesOnReviewVersion();

    const [comment, setComment] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setComment("");
            setValidationError(null);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        const trimmed = comment.trim();

        if (trimmed === "") {
            setValidationError(t("clientReviews:requestChangesModal.errors.empty"));
            return;
        }

        if (trimmed.length > MAX_BODY_LENGTH) {
            setValidationError(t("clientReviews:requestChangesModal.errors.tooLong"));
            return;
        }

        setValidationError(null);

        try {
            await requestChangesOnReviewVersion({
                reviewVersionUuid,
                reviewUuid,
                projectUuid,
                comment: trimmed,
            });
            addToast(ToastType.Success, t("clientReviews:toast.requestChangesSuccess"));
            onClose();
        } catch {
            addToast(ToastType.Error, t("clientReviews:toast.requestChangesError"));
        }
    };

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} width="w-150" height="h-auto">
            <div className="flex flex-col gap-4 p-6">
                <header>
                    <h2 className="text-heading-lg text-dark">
                        {t("clientReviews:requestChangesModal.title")}
                    </h2>
                    <p className="text-body-sm text-muted-2 mt-1">
                        {t("clientReviews:requestChangesModal.subtitle")}
                    </p>
                </header>

                <TextArea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("clientReviews:requestChangesModal.placeholder")}
                    textStyle="text-body-sm"
                    rows={6}
                    autoFocus
                />

                {validationError && (
                    <p className="text-body-xs text-danger">{validationError}</p>
                )}

                <footer className="flex flex-row justify-end gap-2">
                    <Button type="button" style="secondary" width="w-auto" onClick={onClose} disabled={isPending}>
                        {t("clientReviews:requestChangesModal.cancel")}
                    </Button>
                    <Button
                        type="button"
                        style="primary"
                        width="w-auto"
                        onClick={handleSubmit}
                        isLoading={isPending}
                        disabled={isPending}
                    >
                        {t("clientReviews:requestChangesModal.submit")}
                    </Button>
                </footer>
            </div>
        </ModalOverlay>
    );
}
