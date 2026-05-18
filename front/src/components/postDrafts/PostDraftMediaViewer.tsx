import { useTranslation } from "react-i18next";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { MediaType } from "~/models/enums/MediaType";
import { PostDraftRevisionOptimizationStatus } from "~/models/enums/PostDraftRevisionOptimizationStatus";
import type { PostDraftRevision } from "~/models/PostDraftRevision";
import PostDraftVideoViewer from "./PostDraftVideoViewer";
import PostDraftImageViewer from "./PostDraftImageViewer";
import PostDraftCarouselViewer from "./PostDraftCarouselViewer";

interface PostDraftMediaViewerProps {
    revision: PostDraftRevision;
    mediaType: MediaType;
}

export default function PostDraftMediaViewer({ revision, mediaType }: PostDraftMediaViewerProps) {
    const { t } = useTranslation();

    if (revision.optimizationStatus === PostDraftRevisionOptimizationStatus.Pending
        || revision.optimizationStatus === PostDraftRevisionOptimizationStatus.Optimizing) {
        return (
            <div className="rounded-2xl overflow-hidden bg-dark shadow-md mb-4">
                <div className="w-full aspect-video bg-clear-3 flex flex-col items-center justify-center gap-2">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-body-sm text-muted">{t("postDrafts:detail.filesPending")}</p>
                </div>
            </div>
        );
    }

    if (revision.optimizationStatus === PostDraftRevisionOptimizationStatus.Failed) {
        return (
            <div className="rounded-2xl overflow-hidden bg-dark shadow-md mb-4">
                <div className="w-full aspect-video bg-clear-3 flex flex-col items-center justify-center gap-2 px-6 text-center">
                    <ExclamationCircleIcon className="size-6 text-danger" strokeWidth={1.8} />
                    <p className="text-body-sm text-danger">{t("postDrafts:detail.filesFailed")}</p>
                </div>
            </div>
        );
    }

    if (mediaType === MediaType.Video) {
        return <PostDraftVideoViewer revisionUuid={revision.uuid} />;
    }

    if (mediaType === MediaType.Image) {
        return <PostDraftImageViewer revisionUuid={revision.uuid} />;
    }

    return <PostDraftCarouselViewer revisionUuid={revision.uuid} fileCount={revision.fileCount} />;
}
