import type { RefObject } from "react";
import { MediaType } from "~/models/enums/MediaType";
import type { ReviewVersion } from "~/models/ReviewVersion";
import ReviewVideoViewer from "./ReviewVideoViewer";
import ReviewImageViewer from "./ReviewImageViewer";
import ReviewCarouselViewer from "./ReviewCarouselViewer";

interface ReviewMediaViewerProps {
  reviewVersion: ReviewVersion;
  mediaType: MediaType;
  videoElementRef?: RefObject<HTMLVideoElement | null>;
}

export default function ReviewMediaViewer({ reviewVersion, mediaType, videoElementRef }: ReviewMediaViewerProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      {mediaType === MediaType.Video && (
        <ReviewVideoViewer
          reviewVersionUuid={reviewVersion.uuid}
          videoStreamingStatus={reviewVersion.videoStreamingStatus}
          videoElementRef={videoElementRef}
        />
      )}
      {mediaType === MediaType.Image && <ReviewImageViewer reviewVersionUuid={reviewVersion.uuid} />}
      {mediaType === MediaType.Carousel && (
        <ReviewCarouselViewer reviewVersionUuid={reviewVersion.uuid} fileCount={reviewVersion.fileCount} />
      )}
    </div>
  );
}
