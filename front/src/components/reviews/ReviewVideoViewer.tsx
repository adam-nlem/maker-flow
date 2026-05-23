import { useRef, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useShowReviewVersionFile } from "~/hooks/api/reviews/useShowReviewVersionFile";
import { VideoStreamingStatus } from "~/models/enums/VideoStreamingStatus";
import ReviewVideoPlayer from "./ReviewVideoPlayer";

interface ReviewVideoViewerProps {
  reviewVersionUuid: string;
  videoStreamingStatus: VideoStreamingStatus | null;
  videoElementRef?: RefObject<HTMLVideoElement | null>;
}

export default function ReviewVideoViewer({
  reviewVersionUuid,
  videoStreamingStatus,
  videoElementRef,
}: ReviewVideoViewerProps) {
  const { t } = useTranslation();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const effectiveVideoRef = videoElementRef ?? localVideoRef;
  const [hlsError, setHlsError] = useState<Error | null>(null);

  const useLegacyBlob = videoStreamingStatus === null;
  const { fileUrl } = useShowReviewVersionFile(
    useLegacyBlob ? reviewVersionUuid : undefined,
    useLegacyBlob ? 1 : undefined,
  );

  const isTranscoding =
    videoStreamingStatus === VideoStreamingStatus.Pending ||
    videoStreamingStatus === VideoStreamingStatus.Processing;
  const hasTranscodeFailed = videoStreamingStatus === VideoStreamingStatus.Failed;
  const hasPlaybackFailed = hlsError !== null && !isTranscoding && !hasTranscodeFailed;
  const isLegacyLoading = useLegacyBlob && !fileUrl;
  const showVideoElement = !isTranscoding && !hasTranscodeFailed && !hasPlaybackFailed && !isLegacyLoading;

  return (
    <div className="shrink-0 w-[100vh] h-[50vh] rounded-xl overflow-hidden bg-dark mb-4">
      <div className="bg-dark flex items-center w-full h-full justify-center">
        {isTranscoding && (
          <div className="flex flex-col items-center gap-3 text-clear text-sm">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>{t("reviews:detail.video.transcoding")}</span>
          </div>
        )}

        {hasTranscodeFailed && (
          <span className="text-clear text-sm px-4 text-center">
            {t("reviews:detail.video.transcodingFailed")}
          </span>
        )}

        {hasPlaybackFailed && (
          <span className="text-clear text-sm px-4 text-center">
            {t("reviews:detail.video.playbackError")}
          </span>
        )}

        {isLegacyLoading && (
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}

        {showVideoElement && (
          <ReviewVideoPlayer
            reviewVersionUuid={reviewVersionUuid}
            videoStreamingStatus={videoStreamingStatus}
            videoElementRef={effectiveVideoRef}
            src={useLegacyBlob ? fileUrl : undefined}
            onPlaybackError={setHlsError}
          />
        )}
      </div>
    </div>
  );
}
