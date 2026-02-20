import { ArrowUpOnSquareIcon, BookmarkIcon, ChatBubbleLeftIcon, ClockIcon, EyeIcon, HeartIcon, SparklesIcon, UsersIcon } from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";

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
};

export const postInsightTypeToFrenchTranslation: Record<PostInsightType, string> = {
    [PostInsightType.Reach]: "Portée",
    [PostInsightType.TotalInteractions]: "Interactions totales",
    [PostInsightType.Saved]: "Enregistrements",
    [PostInsightType.Shares]: "Partages",
    [PostInsightType.Views]: "Vues",
    [PostInsightType.Likes]: "Likes",
    [PostInsightType.Comments]: "Commentaires",
    [PostInsightType.AverageWatchTime]: "Temps de visionnage moyen",
    [PostInsightType.TotalWatchTime]: "Temps de visionnage total",
};

export const postInsightTypeOptions = Object.values(PostInsightType);
