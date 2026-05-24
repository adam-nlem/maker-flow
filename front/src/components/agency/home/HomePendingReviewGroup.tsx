import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";
import { ReviewCommentsGroupedByReviewDTO } from "~/dtos/reviews/ReviewCommentsGroupedByReviewDTO";
import { agencyReviewsPath } from "~/routes/routePaths";
import ReviewCommentTile from "~/components/reviews/ReviewCommentTile";

interface HomePendingReviewGroupProps {
  group: ReviewCommentsGroupedByReviewDTO;
  projectUuid: string;
}

export default function HomePendingReviewGroup({ group, projectUuid }: HomePendingReviewGroupProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectReview = useReviewsStore((s) => s.selectReview);

  const review = group.review.review;
  const reviewVersionUuid = group.review.latestVersion?.uuid ?? "";

  const handleNavigateToReview = () => {
    selectReview(review.uuid);
    navigate(agencyReviewsPath);
  };

  return (
    <div className="flex flex-col ">
      <div
        onClick={handleNavigateToReview}
        className="w-full text-left flex flex-row items-center justify-between gap-2 px-4 py-3 hover:bg-clear-2 transition-colors cursor-pointer"
      >
        <h3 className="text-heading-sm truncate">{review.title}</h3>
        <div className="flex flex-row items-center gap-1 shrink-0 text-muted-2">
          <span className="text-body-xs">
            {t("home:pendingReviewComments.openCount", { count: group.comments.length })}
          </span>
          <ChevronRightIcon className="size-4" strokeWidth={2} />
        </div>
      </div>

      <div className="flex flex-col gap-1 px-2 pb-2">
        {group.comments.map((comment) => (
          <ReviewCommentTile
            key={comment.uuid}
            comment={comment}
            reviewVersionUuid={reviewVersionUuid}
            reviewUuid={review.uuid}
            projectUuid={projectUuid}
            isAgencyViewer
            canReply={false}
            canResolve={false}
            canSeek={false}
            onClick={handleNavigateToReview}
          />
        ))}
      </div>
    </div>
  );
}
