import { BookmarkIcon, ChatBubbleLeftIcon, EyeIcon, FilmIcon, HandThumbDownIcon, HandThumbUpIcon, LinkIcon, ShareIcon, SparklesIcon, UserPlusIcon, UsersIcon } from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";

export enum SocialAnalyticsIntegrationInsightType {
    Views = 'views',
    Likes = 'likes',
    Saves = 'saves',
    Comments = 'comments',
    Shares = 'shares',
    Followers = 'followers',
    TotalFollowers = 'total_followers',
    Impressions = 'impressions',
    Dislikes = 'dislikes',
    ProfileLinksTaps = 'profile_links_taps',
    Reach = 'reach',
    Videos = 'videos',
}

export const socialAnalyticsIntegrationInsightTypeToIcon: Record<SocialAnalyticsIntegrationInsightType, ComponentType<SVGProps<SVGSVGElement>>> = {
    [SocialAnalyticsIntegrationInsightType.Views]: EyeIcon,
    [SocialAnalyticsIntegrationInsightType.Likes]: HandThumbUpIcon,
    [SocialAnalyticsIntegrationInsightType.Saves]: BookmarkIcon,
    [SocialAnalyticsIntegrationInsightType.Comments]: ChatBubbleLeftIcon,
    [SocialAnalyticsIntegrationInsightType.Shares]: ShareIcon,
    [SocialAnalyticsIntegrationInsightType.Followers]: UserPlusIcon,
    [SocialAnalyticsIntegrationInsightType.TotalFollowers]: UsersIcon,
    [SocialAnalyticsIntegrationInsightType.Impressions]: SparklesIcon,
    [SocialAnalyticsIntegrationInsightType.Dislikes]: HandThumbDownIcon,
    [SocialAnalyticsIntegrationInsightType.ProfileLinksTaps]: LinkIcon,
    [SocialAnalyticsIntegrationInsightType.Reach]: UsersIcon,
    [SocialAnalyticsIntegrationInsightType.Videos]: FilmIcon,
};

export const socialAnalyticsIntegrationInsightTypeToFrenchTranslation: Record<SocialAnalyticsIntegrationInsightType, string> = {
    [SocialAnalyticsIntegrationInsightType.Views]: "Vues",
    [SocialAnalyticsIntegrationInsightType.Likes]: "J'aime",
    [SocialAnalyticsIntegrationInsightType.Saves]: "Enregistrements",
    [SocialAnalyticsIntegrationInsightType.Comments]: "Commentaires",
    [SocialAnalyticsIntegrationInsightType.Shares]: "Partages",
    [SocialAnalyticsIntegrationInsightType.Followers]: "Nouveaux abonnés",
    [SocialAnalyticsIntegrationInsightType.TotalFollowers]: "Abonnés",
    [SocialAnalyticsIntegrationInsightType.Impressions]: "Impressions",
    [SocialAnalyticsIntegrationInsightType.Dislikes]: "Je n'aime pas",
    [SocialAnalyticsIntegrationInsightType.ProfileLinksTaps]: "Clics liens profil",
    [SocialAnalyticsIntegrationInsightType.Reach]: "Portée",
    [SocialAnalyticsIntegrationInsightType.Videos]: "Vidéos",
};

export const socialAnalyticsIntegrationInsightTypeOptions = Object.values(SocialAnalyticsIntegrationInsightType)
