
import { BookmarkIcon, ArrowUpOnSquareIcon, ChatBubbleLeftIcon, EyeIcon, FilmIcon, HandThumbDownIcon, LinkIcon, SparklesIcon, UserPlusIcon, UsersIcon, HeartIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export enum IntegrationInsightType {
    Views = 'views',
    Likes = 'likes',
    Saves = 'saves',
    Comments = 'comments',
    Shares = 'shares',
    GainedFollowers = 'gained_followers',
    TotalFollowers = 'total_followers',
    Impressions = 'impressions',
    Dislikes = 'dislikes',
    ProfileLinksTaps = 'profile_links_taps',
    Reach = 'reach',
    Videos = 'videos',
}

export const integrationInsightTypeToIcon: Record<IntegrationInsightType, ComponentType<SVGProps<SVGSVGElement>>> = {
    [IntegrationInsightType.Views]: EyeIcon,
    [IntegrationInsightType.Likes]: HeartIcon,
    [IntegrationInsightType.Saves]: BookmarkIcon,
    [IntegrationInsightType.Comments]: ChatBubbleLeftIcon,
    [IntegrationInsightType.Shares]: ArrowUpOnSquareIcon,
    [IntegrationInsightType.GainedFollowers]: UserPlusIcon,
    [IntegrationInsightType.TotalFollowers]: UsersIcon,
    [IntegrationInsightType.Impressions]: SparklesIcon,
    [IntegrationInsightType.Dislikes]: HandThumbDownIcon,
    [IntegrationInsightType.ProfileLinksTaps]: LinkIcon,
    [IntegrationInsightType.Reach]: UsersIcon,
    [IntegrationInsightType.Videos]: FilmIcon,
};

export const integrationInsightTypeTranslationKeys: Record<IntegrationInsightType, string> = {
    [IntegrationInsightType.Views]: "enums:integrationInsightType.views",
    [IntegrationInsightType.Likes]: "enums:integrationInsightType.likes",
    [IntegrationInsightType.Saves]: "enums:integrationInsightType.saves",
    [IntegrationInsightType.Comments]: "enums:integrationInsightType.comments",
    [IntegrationInsightType.Shares]: "enums:integrationInsightType.shares",
    [IntegrationInsightType.GainedFollowers]: "enums:integrationInsightType.gainedFollowers",
    [IntegrationInsightType.TotalFollowers]: "enums:integrationInsightType.totalFollowers",
    [IntegrationInsightType.Impressions]: "enums:integrationInsightType.impressions",
    [IntegrationInsightType.Dislikes]: "enums:integrationInsightType.dislikes",
    [IntegrationInsightType.ProfileLinksTaps]: "enums:integrationInsightType.profileLinksTaps",
    [IntegrationInsightType.Reach]: "enums:integrationInsightType.reach",
    [IntegrationInsightType.Videos]: "enums:integrationInsightType.videos",
};

export const integrationInsightTypeOptions = Object.values(IntegrationInsightType)
