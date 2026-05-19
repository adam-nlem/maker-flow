import { MediaType } from "~/models/enums/MediaType";
import type { PostDraftMediaVersion } from "~/models/PostDraftMediaVersion";
import PostDraftVideoViewer from "./PostDraftVideoViewer";
import PostDraftImageViewer from "./PostDraftImageViewer";
import PostDraftCarouselViewer from "./PostDraftCarouselViewer";

interface PostDraftMediaViewerProps {
    mediaVersion: PostDraftMediaVersion;
    mediaType: MediaType;
}

export default function PostDraftMediaViewer({ mediaVersion, mediaType }: PostDraftMediaViewerProps) {
    if (mediaType === MediaType.Video) {
        return <PostDraftVideoViewer mediaVersionUuid={mediaVersion.uuid} />;
    }

    if (mediaType === MediaType.Image) {
        return <PostDraftImageViewer mediaVersionUuid={mediaVersion.uuid} />;
    }

    return <PostDraftCarouselViewer mediaVersionUuid={mediaVersion.uuid} fileCount={mediaVersion.fileCount} />;
}
