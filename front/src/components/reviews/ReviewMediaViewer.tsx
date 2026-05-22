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
    if (mediaType === MediaType.Video) {
        return <ReviewVideoViewer reviewVersionUuid={reviewVersion.uuid} videoElementRef={videoElementRef} />;
    }

    if (mediaType === MediaType.Image) {
        return <ReviewImageViewer reviewVersionUuid={reviewVersion.uuid} />;
    }

    return <ReviewCarouselViewer reviewVersionUuid={reviewVersion.uuid} fileCount={reviewVersion.fileCount} />;
}
