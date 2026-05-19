import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useShowPostDraftMediaVersionFile } from "~/hooks/api/postDrafts/useShowPostDraftMediaVersionFile";
import { formatDurationToClock } from "~/utils/durationFormatters";

interface PostDraftVideoViewerProps {
    mediaVersionUuid: string;
}

export default function PostDraftVideoViewer({ mediaVersionUuid }: PostDraftVideoViewerProps) {
    const { t } = useTranslation();
    const { fileUrl } = useShowPostDraftMediaVersionFile(mediaVersionUuid, 1);
    const [duration, setDuration] = useState<number | null>(null);

    const handleLoadedMetadata = (event: React.SyntheticEvent<HTMLVideoElement>) => {
        setDuration(event.currentTarget.duration);
    };

    return (
        <div className="rounded-2xl overflow-hidden bg-dark shadow-md mb-4">
            <div className="w-full bg-dark min-h-80 flex items-center justify-center">
                {fileUrl ? (
                    <video
                        className="w-full max-h-[70vh] bg-dark"
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
                <span>{t("postDrafts:detail.mediaLabel.video")}</span>
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
