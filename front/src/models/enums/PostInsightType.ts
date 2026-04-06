import { ArrowUpOnSquareIcon, BookmarkIcon, ChartBarIcon, ChatBubbleLeftIcon, ClockIcon, EyeIcon, HandThumbDownIcon, HeartIcon, SparklesIcon, UserPlusIcon, UsersIcon } from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";
import { formatDurationToFrench } from "~/utils/durationFormatters";
import { formatCompactNumber } from "~/utils/numberFormatters";

export enum PostInsightType {
    Reach = 'reach',
    TotalInteractions = 'total_interactions',
    Saved = 'saved',
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
    [PostInsightType.Saved]: BookmarkIcon,
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

export const postInsightTypeToFrenchTranslation: Record<PostInsightType, string> = {
    [PostInsightType.Reach]: "Portée",
    [PostInsightType.TotalInteractions]: "Interactions",
    [PostInsightType.Saved]: "Enregistrements",
    [PostInsightType.Shares]: "Partages",
    [PostInsightType.Views]: "Vues",
    [PostInsightType.Likes]: "Likes",
    [PostInsightType.Comments]: "Commentaires",
    [PostInsightType.AverageWatchTime]: "Temps de visionnage moyen",
    [PostInsightType.TotalWatchTime]: "Temps de visionnage total",
    [PostInsightType.Dislikes]: "Je n'aime pas",
    [PostInsightType.ThumbnailImpressions]: "Impressions miniature",
    [PostInsightType.ThumbnailImpressionsClickRate]: "Taux de clics miniature",
    [PostInsightType.FollowersGained]: "Abonnés gagnés",
    [PostInsightType.FollowersLost]: "Abonnés perdus",
    [PostInsightType.AudienceWatchRatio]: "Ratio de visionnage",
};

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
