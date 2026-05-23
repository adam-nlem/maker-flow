import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/Button";
import ReviewFileDropzone from "./ReviewFileDropzone";
import { useCreateReviewVersion } from "~/hooks/api/reviews/useCreateReviewVersion";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";
import { useToastStore } from "~/stores/toast/toastStore";
import { ToastType } from "~/models/enums/ToastType";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";

interface ReviewVersionUploaderProps {
    reviewDTO: ReviewWithLatestVersionDTO;
    projectUuid: string;
}

export default function ReviewVersionUploader({ reviewDTO, projectUuid }: ReviewVersionUploaderProps) {
    const { t } = useTranslation();
    const addToast = useToastStore((s) => s.addToast);
    const selectVersion = useReviewsStore((s) => s.selectVersion);

    const [files, setFiles] = useState<File[]>([]);

    const {
        createReviewVersion,
        isPending,
        validationErrorKey,
        clearValidationError,
    } = useCreateReviewVersion();

    const handleFilesChange = (next: File[]) => {
        clearValidationError();
        setFiles(next);
    };

    const handleSubmit = async () => {
        if (files.length === 0) return;

        try {
            const result = await createReviewVersion({
                reviewUuid: reviewDTO.review.uuid,
                projectUuid,
                mediaType: reviewDTO.review.mediaType,
                files,
            });

            if (!result) return;

            setFiles([]);
            selectVersion(null);
            addToast(ToastType.Success, t("reviews:upload.toast.success"));
        } catch {
            addToast(ToastType.Error, t("reviews:upload.toast.error"));
        }
    };

    return (
        <div className="px-3 py-3 border-t border-pale-gray flex flex-col gap-2">
            <p className="uppercase text-body-xs tracking-wider text-muted">
                {t("reviews:upload.title")}
            </p>
            <ReviewFileDropzone
                mediaType={reviewDTO.review.mediaType}
                files={files}
                onChange={handleFilesChange}
                errorMessage={validationErrorKey ? t(validationErrorKey) : undefined}
            />
            {files.length > 0 && (
                <Button
                    type="button"
                    style="primary"
                    width="w-auto"
                    onClick={handleSubmit}
                    isLoading={isPending}
                    disabled={isPending}
                >
                    {t("reviews:upload.submit")}
                </Button>
            )}
        </div>
    );
}
