import { ArrowUpOnSquareIcon, BookmarkIcon, ChartBarIcon, ChatBubbleLeftIcon, ClockIcon, EyeIcon, HandThumbDownIcon, HeartIcon, SparklesIcon, UserPlusIcon, UsersIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { formatDurationToFrench } from "~/utils/durationFormatters";
import { formatCompactNumber } from "~/utils/numberFormatters";

export enum PostInsightType {
    Reach = 'reach',
    TotalInteractions = 'total_interactions',
    Saves = 'saves',
    Shares = 'shares',
    Views = 'views',
    Likes = 'likes',
    Comments = 'comments',
    AverageWatchTime = 'average_watch_time',
    TotalWatchTime = 'total_watch_time',
    Dislikes = 'dislikes',
    ThumbnailImpressions = 'thumbnail_impressions',
    ThumbnailImpressionsClickRate = 'thumbnail_impressions_click_rate',
    FollowersGained = 'followers_gained',
    FollowersLost = 'followers_lost',
    AudienceWatchRatio = 'audience_watch_ratio',
}

export const postInsightTypeToIcon: Record<PostInsightType, ComponentType<SVGProps<SVGSVGElement>>> = {
    [PostInsightType.Reach]: UsersIcon,
    [PostInsightType.TotalInteractions]: SparklesIcon,
    [PostInsightType.Saves]: BookmarkIcon,
    [PostInsightType.Shares]: ArrowUpOnSquareIcon,
    [PostInsightType.Views]: EyeIcon,
    [PostInsightType.Likes]: HeartIcon,
    [PostInsightType.Comments]: ChatBubbleLeftIcon,
    [PostInsightType.AverageWatchTime]: ClockIcon,
    [PostInsightType.TotalWatchTime]: ClockIcon,
    [PostInsightType.Dislikes]: HandThumbDownIcon,
    [PostInsightType.ThumbnailImpressions]: EyeIcon,
    [PostInsightType.ThumbnailImpressionsClickRate]: ChartBarIcon,
    [PostInsightType.FollowersGained]: UserPlusIcon,
    [PostInsightType.FollowersLost]: UsersIcon,
    [PostInsightType.AudienceWatchRatio]: ChartBarIcon,
};

export const postInsightTypeTranslationKeys: Record<PostInsightType, string> = {
    [PostInsightType.Reach]: "enums:postInsightType.reach",
    [PostInsightType.TotalInteractions]: "enums:postInsightType.totalInteractions",
    [PostInsightType.Saves]: "enums:postInsightType.saves",
    [PostInsightType.Shares]: "enums:postInsightType.shares",
    [PostInsightType.Views]: "enums:postInsightType.views",
    [PostInsightType.Likes]: "enums:postInsightType.likes",
    [PostInsightType.Comments]: "enums:postInsightType.comments",
    [PostInsightType.AverageWatchTime]: "enums:postInsightType.averageWatchTime",
    [PostInsightType.TotalWatchTime]: "enums:postInsightType.totalWatchTime",
    [PostInsightType.Dislikes]: "enums:postInsightType.dislikes",
    [PostInsightType.ThumbnailImpressions]: "enums:postInsightType.thumbnailImpressions",
    [PostInsightType.ThumbnailImpressionsClickRate]: "enums:postInsightType.thumbnailImpressionsClickRate",
    [PostInsightType.FollowersGained]: "enums:postInsightType.followersGained",
    [PostInsightType.FollowersLost]: "enums:postInsightType.followersLost",
    [PostInsightType.AudienceWatchRatio]: "enums:postInsightType.audienceWatchRatio",
};

export const postInsightTypeToEngagementColor: Partial<Record<PostInsightType, string>> = {
    [PostInsightType.Likes]: "var(--color-primary)",
    [PostInsightType.Comments]: "var(--color-purple)",
    [PostInsightType.Shares]: "var(--color-green)",
    [PostInsightType.Dislikes]: "var(--color-danger)",
};

export const postInsightTypeToEngagementBgClass: Partial<Record<PostInsightType, string>> = {
    [PostInsightType.Likes]: "bg-primary",
    [PostInsightType.Comments]: "bg-purple",
    [PostInsightType.Shares]: "bg-green",
    [PostInsightType.Dislikes]: "bg-danger",
};

export const postInsightOverviewTypes = new Set<PostInsightType>([
    PostInsightType.Views,
    PostInsightType.TotalInteractions,
    PostInsightType.AverageWatchTime,
    PostInsightType.TotalWatchTime,
    PostInsightType.Reach,
    PostInsightType.ThumbnailImpressions,
    PostInsightType.ThumbnailImpressionsClickRate,
    PostInsightType.AudienceWatchRatio,
    PostInsightType.Saves,
]);

export const postInsightEngagementTypes = new Set<PostInsightType>([
    PostInsightType.Likes,
    PostInsightType.Comments,
    PostInsightType.Shares,
    PostInsightType.Dislikes,
]);

export const postInsightFollowerTypes = new Set<PostInsightType>([
    PostInsightType.FollowersGained,
    PostInsightType.FollowersLost,
]);

export const postInsightTypeOptions = Object.values(PostInsightType);

/**
 * Formats an insight value based on its type.
 * Duration types use French duration format, others use compact number format.
 */
export function formatPostInsightValue(type: PostInsightType, value: number): string {
    if (type === PostInsightType.TotalWatchTime || type === PostInsightType.AverageWatchTime) {
        return formatDurationToFrench(value)
    }
    return formatCompactNumber(value)
}
