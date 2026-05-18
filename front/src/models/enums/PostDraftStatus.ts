import { CheckCircleIcon, ClockIcon, PencilSquareIcon, XCircleIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export enum PostDraftStatus {
    AwaitingReview = 'awaiting_review',
    ChangesRequested = 'changes_requested',
    Approved = 'approved',
    Rejected = 'rejected',
}

export const postDraftStatusTranslationKeys: Record<PostDraftStatus, string> = {
    [PostDraftStatus.AwaitingReview]: "postDrafts:status.awaitingReview",
    [PostDraftStatus.ChangesRequested]: "postDrafts:status.changesRequested",
    [PostDraftStatus.Approved]: "postDrafts:status.approved",
    [PostDraftStatus.Rejected]: "postDrafts:status.rejected",
};

export const postDraftStatusToBannerTitleKey: Record<PostDraftStatus, string> = {
    [PostDraftStatus.AwaitingReview]: "postDrafts:banner.awaitingReview.title",
    [PostDraftStatus.ChangesRequested]: "postDrafts:banner.changesRequested.title",
    [PostDraftStatus.Approved]: "postDrafts:banner.approved.title",
    [PostDraftStatus.Rejected]: "postDrafts:banner.rejected.title",
};

export const postDraftStatusToBannerSubtitleKey: Record<PostDraftStatus, string> = {
    [PostDraftStatus.AwaitingReview]: "postDrafts:banner.awaitingReview.subtitle",
    [PostDraftStatus.ChangesRequested]: "postDrafts:banner.changesRequested.subtitle",
    [PostDraftStatus.Approved]: "postDrafts:banner.approved.subtitle",
    [PostDraftStatus.Rejected]: "postDrafts:banner.rejected.subtitle",
};

export const postDraftStatusToBgClass: Record<PostDraftStatus, string> = {
    [PostDraftStatus.AwaitingReview]: "bg-dark/10",
    [PostDraftStatus.ChangesRequested]: "bg-yellow/10",
    [PostDraftStatus.Approved]: "bg-primary/10",
    [PostDraftStatus.Rejected]: "bg-danger/10",
};

export const postDraftStatusToTextClass: Record<PostDraftStatus, string> = {
    [PostDraftStatus.AwaitingReview]: "text-dark",
    [PostDraftStatus.ChangesRequested]: "text-yellow",
    [PostDraftStatus.Approved]: "text-primary",
    [PostDraftStatus.Rejected]: "text-danger",
};

export const postDraftStatusToBorderClass: Record<PostDraftStatus, string> = {
    [PostDraftStatus.AwaitingReview]: "border border-dark/20",
    [PostDraftStatus.ChangesRequested]: "border border-yellow/30",
    [PostDraftStatus.Approved]: "border border-primary/30",
    [PostDraftStatus.Rejected]: "border border-danger/30",
};

export const postDraftStatusToIcon: Record<PostDraftStatus, ComponentType<SVGProps<SVGSVGElement>>> = {
    [PostDraftStatus.AwaitingReview]: ClockIcon,
    [PostDraftStatus.ChangesRequested]: PencilSquareIcon,
    [PostDraftStatus.Approved]: CheckCircleIcon,
    [PostDraftStatus.Rejected]: XCircleIcon,
};
