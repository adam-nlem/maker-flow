import { type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";
import { MediaType } from "~/models/enums/MediaType";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useListPaginatedReviewComments } from "~/hooks/api/reviews/useListPaginatedReviewComments";
import { Button } from "~/components/ui/Button";
import ReviewCommentItem from "./ReviewCommentItem";
import CreateReviewCommentForm from "./CreateReviewCommentForm";

interface ReviewCommentsTimelineProps {
  reviewDTO: ReviewWithLatestVersionDTO;
  projectUuid: string;
  videoElementRef?: RefObject<HTMLVideoElement | null>;
}

export default function ReviewCommentsTimeline({ reviewDTO, projectUuid, videoElementRef }: ReviewCommentsTimelineProps) {
  const { t } = useTranslation();
  const { user } = useCurrentUser();

  const isAgencyViewer = user !== null && user !== undefined && !user.isClient;
  const isVideoDraft = reviewDTO.review.mediaType === MediaType.Video;
  const latestVersionUuid = reviewDTO.latestVersion?.uuid ?? null;

  const { comments, isLoading, isLoadingMore, hasMore, listMore } = useListPaginatedReviewComments({
    reviewVersionUuid: latestVersionUuid,
  });

  if (reviewDTO.latestVersion === null) {
    return null;
  }

  const hasComments = comments.length > 0;

  return (
    <section className="mt-8">
      <h2 className="text-heading-md text-dark mb-3">
        {t("reviews:comments.title")}
      </h2>
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p className="text-body-sm text-muted-2 italic">
            {t("reviews:comments.loading")}
          </p>
        ) : hasComments ? (
          comments.map((comment) => (
            <ReviewCommentItem
              key={comment.uuid}
              comment={comment}
              reviewVersionUuid={reviewDTO.latestVersion!.uuid}
              reviewUuid={reviewDTO.review.uuid}
              projectUuid={projectUuid}
              isAgencyViewer={isAgencyViewer}
              canReply={true}
              canSeek={isVideoDraft}
              videoElementRef={isVideoDraft ? videoElementRef : undefined}
            />
          ))
        ) : (
          <p className="text-body-sm text-muted-2 italic">
            {t("reviews:comments.noComments")}
          </p>
        )}

        {hasMore && (
          <Button
            type="button"
            style="secondary"
            width="w-auto"
            onClick={() => listMore()}
            isLoading={isLoadingMore}
            disabled={isLoadingMore}
          >
            {t("reviews:comments.loadMore")}
          </Button>
        )}

        <CreateReviewCommentForm
          reviewVersionUuid={reviewDTO.latestVersion.uuid}
          reviewUuid={reviewDTO.review.uuid}
          projectUuid={projectUuid}
          showTimecodeInput={isVideoDraft}
          videoElementRef={isVideoDraft ? videoElementRef : undefined}
        />
      </div>
    </section>
  );
}
