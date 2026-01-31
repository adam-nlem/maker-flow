import { ArrowUpOnSquareIcon, BookmarkIcon, ChatBubbleLeftIcon, ClockIcon, EyeIcon, HeartIcon, SparklesIcon, UsersIcon } from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";

export enum SocialAnalyticsPostInsightType {
    Reach = 'reach',
    TotalInteractions = 'total_interactions',
    Saved = 'saved',
    Shares = 'shares',
    Views = 'views',
    Likes = 'likes',
    Comments = 'comments',
    AverageWatchTime = 'average_watch_time',
    TotalWatchTime = 'total_watch_time',
}

export const socialAnalyticsPostInsightTypeToIcon: Record<SocialAnalyticsPostInsightType, ComponentType<SVGProps<SVGSVGElement>>> = {
    [SocialAnalyticsPostInsightType.Reach]: UsersIcon,
    [SocialAnalyticsPostInsightType.TotalInteractions]: SparklesIcon,
    [SocialAnalyticsPostInsightType.Saved]: BookmarkIcon,
    [SocialAnalyticsPostInsightType.Shares]: ArrowUpOnSquareIcon,
    [SocialAnalyticsPostInsightType.Views]: EyeIcon,
    [SocialAnalyticsPostInsightType.Likes]: HeartIcon,
    [SocialAnalyticsPostInsightType.Comments]: ChatBubbleLeftIcon,
    [SocialAnalyticsPostInsightType.AverageWatchTime]: ClockIcon,
    [SocialAnalyticsPostInsightType.TotalWatchTime]: ClockIcon,
};

export const socialAnalyticsPostInsightTypeToFrenchTranslation: Record<SocialAnalyticsPostInsightType, string> = {
    [SocialAnalyticsPostInsightType.Reach]: "Portée",
    [SocialAnalyticsPostInsightType.TotalInteractions]: "Interactions totales",
    [SocialAnalyticsPostInsightType.Saved]: "Enregistrements",
    [SocialAnalyticsPostInsightType.Shares]: "Partages",
    [SocialAnalyticsPostInsightType.Views]: "Vues",
    [SocialAnalyticsPostInsightType.Likes]: "Likes",
    [SocialAnalyticsPostInsightType.Comments]: "Commentaires",
    [SocialAnalyticsPostInsightType.AverageWatchTime]: "Temps de visionnage moyen",
    [SocialAnalyticsPostInsightType.TotalWatchTime]: "Temps de visionnage total",
};

export const socialAnalyticsPostInsightTypeOptions = Object.values(SocialAnalyticsPostInsightType);
