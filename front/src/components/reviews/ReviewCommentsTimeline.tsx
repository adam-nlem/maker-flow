import { type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { ClockIcon } from "@heroicons/react/24/outline";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";
import type { ReviewVersion } from "~/models/ReviewVersion";
import { MediaType } from "~/models/enums/MediaType";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useListPaginatedReviewComments } from "~/hooks/api/reviews/useListPaginatedReviewComments";
import { Button } from "~/components/ui/Button";
import ReviewCommentTile from "./ReviewCommentTile";
import CreateReviewCommentForm from "./CreateReviewCommentForm";

interface ReviewCommentsTimelineProps {
  reviewDTO: ReviewWithLatestVersionDTO;
  activeVersion: ReviewVersion;
  isLatest: boolean;
  projectUuid: string;
  videoElementRef?: RefObject<HTMLVideoElement | null>;
}

export default function ReviewCommentsTimeline({
  reviewDTO,
  activeVersion,
  isLatest,
  projectUuid,
  videoElementRef,
}: ReviewCommentsTimelineProps) {
  const { t } = useTranslation();
  const { user } = useCurrentUser();

  const isAgencyViewer = user !== null && user !== undefined && !user.isClient;
  const isVideoDraft = reviewDTO.review.mediaType === MediaType.Video;

  const { comments, isLoading, isLoadingMore, hasMore, listMore } = useListPaginatedReviewComments({
    reviewVersionUuid: activeVersion.uuid,
  });

  const hasComments = comments.length > 0;

  return (
    <section className="mt-8">
      <h2 className="text-heading-md text-dark mb-3">
        {t("reviews:comments.title")}
      </h2>

      {!isLatest && (
        <div className="flex flex-row items-center gap-2 text-body-sm text-muted-2 bg-clear-2 border border-pale-gray rounded-xl px-4 py-3 mb-3">
          <ClockIcon className="size-4 shrink-0" />
          <span>{t("reviews:versions.switcher.viewingHistorical")}</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p className="text-body-sm text-muted-2 italic">
            {t("reviews:comments.loading")}
          </p>
        ) : hasComments ? (
          comments.map((comment) => (
            <ReviewCommentTile
              key={comment.uuid}
              comment={comment}
              reviewVersionUuid={activeVersion.uuid}
              reviewUuid={reviewDTO.review.uuid}
              projectUuid={projectUuid}
              isAgencyViewer={isAgencyViewer && isLatest}
              canReply={isLatest}
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

        {isLatest && (
          <CreateReviewCommentForm
            reviewVersionUuid={activeVersion.uuid}
            reviewUuid={reviewDTO.review.uuid}
            projectUuid={projectUuid}
            showTimecodeInput={isVideoDraft}
            videoElementRef={isVideoDraft ? videoElementRef : undefined}
          />
        )}
      </div>
    </section>
  );
}
