import { type ReactNode, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Banner } from "~/components/ui/Banner";
import ReviewMediaViewer from "./ReviewMediaViewer";
import ReviewCommentsTimeline from "./ReviewCommentsTimeline";
import ReviewDetailHeader from "./ReviewDetailHeader";
import ReviewDetailBody from "./ReviewDetailBody";
import ReviewVersionDropdown from "./ReviewVersionDropdown";
import { useReviewsStore } from "~/stores/reviews/reviewsStore";
import type { ReviewWithLatestVersionDTO } from "~/dtos/reviews/ReviewWithLatestVersionDTO";
import type { ReviewEditForm } from "~/hooks/useReviewEditForm";
import {
  ReviewStatus,
  reviewStatusToBannerSubtitleKey,
  reviewStatusToBannerTitleKey,
  reviewStatusToBgClass,
  reviewStatusToBorderClass,
  reviewStatusToIcon,
  reviewStatusToTextClass,
} from "~/models/enums/ReviewStatus";
import ReviewDetailSideCard from "./ReviewDetailSideCard";

interface ReviewDetailPanelProps {
  reviewDTO: ReviewWithLatestVersionDTO;
  projectUuid: string;
  /** When provided, the panel wraps its contents in a <form> and exposes title/description edit affordances. */
  form?: ReviewEditForm;
  /** Navigates to the linked script. When omitted, the script-link button is hidden. */
  onOpenLinkedScript?: (scriptUuid: string) => void;
  /** Right-aligned buttons rendered in the title bar (e.g. delete). */
  titleBarActions?: ReactNode;
  /** Rendered inside the body's "linked script" section (agency edit flow); omit on read-only surfaces. */
  linkedScriptField?: ReactNode;
  /** Inserted between the body row and the comments timeline (e.g. client approve bar). */
  footer?: (args: { isLatest: boolean }) => ReactNode;
  /** Modals owned by the role-specific container (e.g. delete dialog). */
  children?: ReactNode;
}

export default function ReviewDetailPanel({
  reviewDTO,
  projectUuid,
  form,
  onOpenLinkedScript,
  titleBarActions,
  linkedScriptField,
  footer,
  children,
}: ReviewDetailPanelProps) {
  const { t } = useTranslation();
  const status = reviewDTO.currentStatus ?? ReviewStatus.Pending;
  const videoElementRef = useRef<HTMLVideoElement>(null);

  const selectedVersionUuid = useReviewsStore((s) => s.selectedVersionUuid);
  const selectVersion = useReviewsStore((s) => s.selectVersion);

  const versions = reviewDTO.versions;
  const latestVersion = reviewDTO.latestVersion;
  const selectedVersion = selectedVersionUuid
    ? versions.find((v) => v.uuid === selectedVersionUuid) ?? null
    : null;
  const activeVersion = selectedVersion ?? latestVersion;
  const isLatest = activeVersion !== null && latestVersion !== null && activeVersion.uuid === latestVersion.uuid;

  const inner = (
    <>
      <Banner
        className="mb-6"
        icon={reviewStatusToIcon[status]}
        title={t(reviewStatusToBannerTitleKey[status])}
        subtitle={t(reviewStatusToBannerSubtitleKey[status])}
        bgClassName={reviewStatusToBgClass[status]}
        textClassName={reviewStatusToTextClass[status]}
        borderClassName={reviewStatusToBorderClass[status]}
      />

      <ReviewDetailHeader
        reviewDTO={reviewDTO}
        form={form}
        onOpenLinkedScript={onOpenLinkedScript}
      />

      {activeVersion && (
        <ReviewVersionDropdown
          versions={versions}
          activeVersionUuid={activeVersion.uuid}
          onSelect={selectVersion}
        />
      )}

      {activeVersion && (
        <ReviewMediaViewer
          reviewVersion={activeVersion}
          mediaType={reviewDTO.review.mediaType}
          videoElementRef={videoElementRef}
        />
      )}

      <div className="flex flex-row gap-3">

        <ReviewDetailBody
          reviewDTO={reviewDTO}
          form={form}
          actions={titleBarActions}
          linkedScriptField={linkedScriptField}
        />
        <ReviewDetailSideCard
          reviewDTO={reviewDTO}
          projectUuid={projectUuid}
          onLinkedScriptClick={!form?.canEdit && onOpenLinkedScript && reviewDTO.review.script
            ? () => onOpenLinkedScript(reviewDTO.review.script!.uuid)
            : undefined}
        />
      </div>

      {activeVersion && (
        <ReviewCommentsTimeline
          reviewDTO={reviewDTO}
          activeVersion={activeVersion}
          isLatest={isLatest}
          projectUuid={projectUuid}
          videoElementRef={videoElementRef}
        />
      )}

      {footer?.({ isLatest })}

      {children}
    </>
  );

  const wrapperClassName = "mx-auto px-10 py-7 pb-24";

  if (form) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.submit();
        }}
        className={wrapperClassName}
      >
        {inner}
      </form>
    );
  }

  return <div className={wrapperClassName}>{inner}</div>;
}
