import { useShowReviewVersionCover } from "~/hooks/api/reviews/useShowReviewVersionCover";
import Shimmer from "~/components/ui/Shimmer";

interface ReviewVideoThumbnailProps {
  reviewVersionUuid?: string;
  className?: string;
}

export default function ReviewVideoThumbnail({ reviewVersionUuid, className = "" }: ReviewVideoThumbnailProps) {
  const { coverUrl, isLoading } = useShowReviewVersionCover(reviewVersionUuid);

  return (
    <div className={`overflow-hidden ${className}`}>
      {isLoading
        ? <Shimmer width="w-full" height="h-full" radius="rounded-none" />
        : coverUrl && <img src={coverUrl} alt="" className="w-full h-full object-cover" />}
    </div>
  );
}
