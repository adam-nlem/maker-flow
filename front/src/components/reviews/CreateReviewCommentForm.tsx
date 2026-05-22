import { useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import { TextArea } from "~/components/ui/TextArea";
import { useCreateReviewComment } from "~/hooks/api/reviews/useCreateReviewComment";
import { useToastStore } from "~/stores/toast/toastStore";
import { ToastType } from "~/models/enums/ToastType";
import { formatDurationToClock } from "~/utils/durationFormatters";

const MAX_BODY_LENGTH = 5000;

interface CreateReviewCommentFormProps {
  reviewVersionUuid: string;
  reviewUuid: string;
  projectUuid: string;
  parentCommentUuid?: string;
  showTimecodeInput?: boolean;
  videoElementRef?: RefObject<HTMLVideoElement | null>;
  onCancel?: () => void;
  onSubmitted?: () => void;
}

export default function CreateReviewCommentForm({
  reviewVersionUuid,
  reviewUuid,
  projectUuid,
  parentCommentUuid,
  showTimecodeInput = false,
  videoElementRef,
  onCancel,
  onSubmitted,
}: CreateReviewCommentFormProps) {
  const { t } = useTranslation();
  const addToast = useToastStore((s) => s.addToast);
  const { createReviewComment, isPending } = useCreateReviewComment();

  const [body, setBody] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pinnedTimecodeSeconds, setPinnedTimecodeSeconds] = useState<number | null>(null);

  const canPinTimecode = showTimecodeInput && parentCommentUuid === undefined && videoElementRef !== undefined;

  const handlePinTimecode = () => {
    const video = videoElementRef?.current;
    if (video) {
      setPinnedTimecodeSeconds(video.currentTime);
    }
  };

  const handleClearPin = () => {
    setPinnedTimecodeSeconds(null);
  };

  const handleSubmit = async () => {
    const trimmed = body.trim();

    if (trimmed === "") {
      setValidationError(t("reviews:comments.composer.errors.empty"));
      return;
    }

    if (trimmed.length > MAX_BODY_LENGTH) {
      setValidationError(t("reviews:comments.composer.errors.tooLong"));
      return;
    }

    setValidationError(null);

    try {
      await createReviewComment({
        reviewUuid,
        projectUuid,
        data: {
          reviewVersionUuid,
          body: trimmed,
          parentCommentUuid,
          videoTimecodeSeconds: canPinTimecode ? pinnedTimecodeSeconds : undefined,
        },
      });
      setBody("");
      setPinnedTimecodeSeconds(null);
      addToast(ToastType.Success, t("reviews:comments.composer.toast.success"));
      onSubmitted?.();
    } catch {
      addToast(ToastType.Error, t("reviews:comments.composer.toast.error"));
    }
  };

  return (
    <div className="flex flex-col border border-pale-gray rounded-xl p-3">
      <TextArea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("reviews:comments.composer.placeholder")}
        textStyle="text-body-sm"
        rows={2}
        simple
      />

      {validationError && (
        <p className="text-xs text-danger">{validationError}</p>
      )}
      <div className="flex flew-row justify-between items-center">
        {canPinTimecode && (
          <div className="flex flex-row items-center gap-2">
            {pinnedTimecodeSeconds === null ? (
              <button
                type="button"
                onClick={handlePinTimecode}
                className="flex flex-row items-center gap-1 text-body-xs text-muted-2 hover:text-dark cursor-pointer"
              >
                <MapPinIcon className="size-4" />
                <span>{t("reviews:comments.composer.pinAtCurrentTime")}</span>
              </button>
            ) : (
              <div className="flex flex-row items-center gap-1 px-2 py-0.5 rounded-full text-body-xs bg-primary/10 text-primary border border-primary/20">
                <MapPinIcon className="size-3.5" />
                <span>
                  {t("reviews:comments.composer.pinnedAt", {
                    time: formatDurationToClock(pinnedTimecodeSeconds),
                  })}
                </span>
                <button
                  type="button"
                  onClick={handleClearPin}
                  aria-label={t("reviews:comments.composer.clearPin")}
                  className="ml-1 hover:text-dark cursor-pointer"
                >
                  <XMarkIcon className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-row justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              style="secondary"
              width="w-auto"
              onClick={onCancel}
              disabled={isPending}
            >
              {t("reviews:comments.composer.cancel")}
            </Button>
          )}
          <Button
            type="button"
            style="primary"
            width="w-auto"
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={isPending}
            shortcut={{ key: "Enter", label: "↵" }}
          >
            {t("reviews:comments.composer.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
