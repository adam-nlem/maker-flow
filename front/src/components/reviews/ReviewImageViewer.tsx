import { useShowReviewVersionFile } from "~/hooks/api/reviews/useShowReviewVersionFile";

interface ReviewImageViewerProps {
    reviewVersionUuid: string;
}

export default function ReviewImageViewer({ reviewVersionUuid }: ReviewImageViewerProps) {
    const { fileUrl } = useShowReviewVersionFile(reviewVersionUuid, 1);

    return (
        <div className="w-2/3 shrink-0 rounded-2xl overflow-hidden bg-dark shadow-md mb-4">
            <div className="w-full bg-dark min-h-80 flex items-center justify-center">
                {fileUrl ? (
                    <img className="max-h-[70vh] w-auto max-w-full object-contain" src={fileUrl} alt="" />
                ) : (
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
            </div>
        </div>
    );
}
