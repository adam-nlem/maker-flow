import { useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useShowReviewVersionFile } from "~/hooks/api/reviews/useShowReviewVersionFile";
import { formatDurationToClock } from "~/utils/durationFormatters";

interface ReviewVideoViewerProps {
  reviewVersionUuid: string;
  videoElementRef?: RefObject<HTMLVideoElement | null>;
}

export default function ReviewVideoViewer({ reviewVersionUuid, videoElementRef }: ReviewVideoViewerProps) {
  const { t } = useTranslation();
  const { fileUrl } = useShowReviewVersionFile(reviewVersionUuid, 1);
  const [duration, setDuration] = useState<number | null>(null);

  const handleLoadedMetadata = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(event.currentTarget.duration);
  };

  return (
    <div className="shrink-0 rounded-2xl overflow-hidden bg-dark shadow-md mb-4">
      <div className="w-full bg-dark min-h-80 flex items-center justify-center">
        {fileUrl ? (
          <video
            ref={videoElementRef}
            className="w-full max-h-[50vh] bg-dark"
            src={fileUrl}
            controls
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
          />
        ) : (
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-clear-3 text-body-xs text-muted">
        <span>{t("reviews:detail.mediaLabel.video")}</span>
        {duration !== null && (
          <>
            <span>·</span>
            <span>{formatDurationToClock(duration)}</span>
          </>
        )}
      </div>
    </div>
  );
}
