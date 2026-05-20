import { CheckCircleIcon, ClockIcon, PencilSquareIcon, XCircleIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export enum ReviewStatus {
    Pending = 'pending',
    ChangesRequested = 'changes_requested',
    Approved = 'approved',
    Rejected = 'rejected',
}

export const reviewStatusTranslationKeys: Record<ReviewStatus, string> = {
    [ReviewStatus.Pending]: "reviews:status.pending",
    [ReviewStatus.ChangesRequested]: "reviews:status.changesRequested",
    [ReviewStatus.Approved]: "reviews:status.approved",
    [ReviewStatus.Rejected]: "reviews:status.rejected",
};

export const reviewStatusToBannerTitleKey: Record<ReviewStatus, string> = {
    [ReviewStatus.Pending]: "reviews:banner.pending.title",
    [ReviewStatus.ChangesRequested]: "reviews:banner.changesRequested.title",
    [ReviewStatus.Approved]: "reviews:banner.approved.title",
    [ReviewStatus.Rejected]: "reviews:banner.rejected.title",
};

export const reviewStatusToBannerSubtitleKey: Record<ReviewStatus, string> = {
    [ReviewStatus.Pending]: "reviews:banner.pending.subtitle",
    [ReviewStatus.ChangesRequested]: "reviews:banner.changesRequested.subtitle",
    [ReviewStatus.Approved]: "reviews:banner.approved.subtitle",
    [ReviewStatus.Rejected]: "reviews:banner.rejected.subtitle",
};

export const reviewStatusToBgClass: Record<ReviewStatus, string> = {
    [ReviewStatus.Pending]: "bg-dark/10",
    [ReviewStatus.ChangesRequested]: "bg-yellow/10",
    [ReviewStatus.Approved]: "bg-primary/10",
    [ReviewStatus.Rejected]: "bg-danger/10",
};

export const reviewStatusToTextClass: Record<ReviewStatus, string> = {
    [ReviewStatus.Pending]: "text-dark",
    [ReviewStatus.ChangesRequested]: "text-yellow",
    [ReviewStatus.Approved]: "text-primary",
    [ReviewStatus.Rejected]: "text-danger",
};

export const reviewStatusToBorderClass: Record<ReviewStatus, string> = {
    [ReviewStatus.Pending]: "border border-dark/20",
    [ReviewStatus.ChangesRequested]: "border border-yellow/30",
    [ReviewStatus.Approved]: "border border-primary/30",
    [ReviewStatus.Rejected]: "border border-danger/30",
};

export const reviewStatusToIcon: Record<ReviewStatus, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ReviewStatus.Pending]: ClockIcon,
    [ReviewStatus.ChangesRequested]: PencilSquareIcon,
    [ReviewStatus.Approved]: CheckCircleIcon,
    [ReviewStatus.Rejected]: XCircleIcon,
};
