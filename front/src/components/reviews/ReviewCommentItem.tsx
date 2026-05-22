import { useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { ChatBubbleOvalLeftEllipsisIcon, CheckIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import AgencyLogo from "~/components/agency/AgencyLogo";
import Pill from "~/components/ui/Pill";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { ReviewComment } from "~/models/ReviewComment";
import { ReviewCommentStatus } from "~/models/enums/ReviewCommentStatus";
import { User } from "~/models/User";
import { useUpdateReviewComment } from "~/hooks/api/reviews/useUpdateReviewComment";
import { useToastStore } from "~/stores/toast/toastStore";
import { ToastType } from "~/models/enums/ToastType";
import { formatToRelative } from "~/utils/dateFormatters";
import { formatDurationToClock } from "~/utils/durationFormatters";
import CreateReviewCommentForm from "./CreateReviewCommentForm";

const MAX_VISUAL_DEPTH = 3;

interface ReviewCommentItemProps {
  comment: ReviewComment;
  reviewVersionUuid: string;
  reviewUuid: string;
  projectUuid: string;
  isAgencyViewer: boolean;
  canReply: boolean;
  canSeek: boolean;
  videoElementRef?: RefObject<HTMLVideoElement | null>;
  depth?: number;
}

export default function ReviewCommentItem({
  comment,
  reviewVersionUuid,
  reviewUuid,
  projectUuid,
  isAgencyViewer,
  canReply,
  canSeek,
  videoElementRef,
  depth = 0,
}: ReviewCommentItemProps) {
  const { t } = useTranslation();
  const addToast = useToastStore((s) => s.addToast);
  const { updateReviewComment, isPending: isUpdatingStatus } = useUpdateReviewComment();

  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const isResolved = comment.isResolved;
  const showResolveToggle = isAgencyViewer && comment.isTopLevel;
  const canSeekChip = canSeek && comment.videoTimecodeSeconds !== null && videoElementRef !== undefined;
  const cappedDepth = Math.min(depth, MAX_VISUAL_DEPTH);

  const handleSeek = () => {
    if (!canSeekChip || comment.videoTimecodeSeconds === null) return;
    const video = videoElementRef?.current;
    if (!video) return;
    video.currentTime = comment.videoTimecodeSeconds;
    video.play().catch(() => { });
  };

  const handleToggleStatus = async () => {
    const nextStatus = isResolved ? ReviewCommentStatus.Open : ReviewCommentStatus.Resolved;
    try {
      await updateReviewComment({
        commentUuid: comment.uuid,
        reviewVersionUuid,
        reviewUuid,
        projectUuid,
        data: { status: nextStatus },
      });
      addToast(
        ToastType.Success,
        t(nextStatus === ReviewCommentStatus.Resolved
          ? "reviews:comments.update.toast.successResolved"
          : "reviews:comments.update.toast.successReopened"),
      );
    } catch {
      addToast(ToastType.Error, t("reviews:comments.update.toast.error"));
    }
  };

  return (
    <div>
      <div className={` ${cappedDepth > 0 ? "border rounded-xl bg-clear-2" : "border-t pt-5"} border-pale-gray p-3 `}>
        <div className="flex flex-row items-start gap-2 mb-2">
          <AuthorAvatar author={comment.author} />
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-2 shrink-0 mb-2">
              <h1 className="text-heading-sm">{comment.author?.fullName}</h1>
              <p className="text-body-xs text-muted-2 mt-0.5">
                {formatToRelative(new Date(comment.createdAt))}
              </p>
              {comment.videoTimecodeSeconds !== null && (
                <Pill
                  icon={PlayCircleIcon}
                  label={formatDurationToClock(comment.videoTimecodeSeconds)}
                  isSelected
                  bgColorClassName="bg-primary/10"
                  borderColorClassName="border-primary/20"
                  textColorClassName="text-primary"
                  onClick={canSeekChip ? handleSeek : undefined}
                />
              )}
              {comment.isTopLevel && isResolved && (
                <div className="uppercase text-heading-xs items-center flex flex-row text-primary">
                  <CheckIcon className="size-3" strokeWidth={3} />
                  <p>{t("reviews:comments.resolved")}</p>
                </div>
              )}
            </div>
            <p className="text-body-sm text-dark-2 whitespace-pre-wrap">{comment.body}</p>
            {comment.replies.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {comment.replies.map((reply) => (
                  <ReviewCommentItem
                    key={reply.uuid}
                    comment={reply}
                    reviewVersionUuid={reviewVersionUuid}
                    reviewUuid={reviewUuid}
                    projectUuid={projectUuid}
                    isAgencyViewer={isAgencyViewer}
                    canReply={canReply}
                    canSeek={canSeek}
                    videoElementRef={videoElementRef}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}

          </div>
        </div>


        <footer className="flex flex-row items-center gap-3 mt-3">
          {canReply && (
            <SimpleTextButton onClick={() => setIsReplyOpen((open) => !open)}>
              <ChatBubbleOvalLeftEllipsisIcon className="size-3.5" />
              <span>{t("reviews:comments.reply")}</span>
            </SimpleTextButton>
          )}
          {showResolveToggle && (
            <SimpleTextButton onClick={isUpdatingStatus ? undefined : handleToggleStatus}>
              <CheckIcon className="size-3.5" />
              <span>{t(isResolved ? "reviews:comments.reopen" : "reviews:comments.resolve")}</span>
            </SimpleTextButton>
          )}
        </footer>
      </div>

      {isReplyOpen && canReply && (
        <div className="mt-2 pl-3">
          <CreateReviewCommentForm
            reviewVersionUuid={reviewVersionUuid}
            reviewUuid={reviewUuid}
            projectUuid={projectUuid}
            parentCommentUuid={comment.uuid}
            onCancel={() => setIsReplyOpen(false)}
            onSubmitted={() => setIsReplyOpen(false)}
          />
        </div>
      )}

    </div>
  );
}

function AuthorAvatar({ author }: { author: User | null }) {
  if (author?.agency) {
    return <AgencyLogo agency={author.agency} className="size-8 shrink-0" />;
  }

  const initial = (author?.project?.name?.trim().charAt(0) ?? "?").toUpperCase();

  return (
    <div className="size-8 shrink-0 flex items-center justify-center rounded-md bg-pale-gray-2 text-muted-2">
      <span className="text-heading-sm font-semibold leading-none">{initial}</span>
    </div>
  );
}

