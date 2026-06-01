import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/Button";
import ReviewFileDropzone from "./ReviewFileDropzone";
import { useCreateReviewVersion } from "~/hooks/api/reviews/useCreateReviewVersion";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";
import { useToastStore } from "~/stores/toast/toastStore";
import { ToastType } from "~/models/enums/ToastType";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";
import { HttpException } from "~/services/httpClient/HttpException";

const VIDEO_HOURS_LIMIT_CODE = 33023;
const STORAGE_LIMIT_CODE = 33024;

interface ReviewVersionUploaderProps {
    reviewDTO: ReviewWithLatestVersionDTO;
    projectUuid: string;
}

export default function ReviewVersionUploader({ reviewDTO, projectUuid }: ReviewVersionUploaderProps) {
    const { t } = useTranslation();
    const addToast = useToastStore((s) => s.addToast);
    const selectVersion = useReviewsStore((s) => s.selectVersion);

    const [files, setFiles] = useState<File[]>([]);
    const [limitErrorKey, setLimitErrorKey] = useState<string | null>(null);

    const {
        createReviewVersion,
        isPending,
        validationErrorKey,
        clearValidationError,
    } = useCreateReviewVersion();

    const handleFilesChange = (next: File[]) => {
        clearValidationError();
        setLimitErrorKey(null);
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
            setLimitErrorKey(null);
            selectVersion(null);
            addToast(ToastType.Success, t("reviews:upload.toast.success"));
        } catch (error) {
            if (error instanceof HttpException && error.response.httpStatus === 402) {
                if (error.response.code === VIDEO_HOURS_LIMIT_CODE) {
                    setLimitErrorKey("settings:subscription.errors.videoHoursLimit");
                    return;
                }
                if (error.response.code === STORAGE_LIMIT_CODE) {
                    setLimitErrorKey("settings:subscription.errors.storageLimit");
                    return;
                }
            }
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
            {limitErrorKey && (
                <p className="text-body-xs text-danger text-center">
                    {t(limitErrorKey)}
                </p>
            )}
        </div>
    );
}
