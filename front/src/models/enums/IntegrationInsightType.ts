
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

export const integrationInsightTypeToFrenchTranslation: Record<IntegrationInsightType, string> = {
    [IntegrationInsightType.Views]: "Vues",
    [IntegrationInsightType.Likes]: "J'aime",
    [IntegrationInsightType.Saves]: "Enregistrements",
    [IntegrationInsightType.Comments]: "Commentaires",
    [IntegrationInsightType.Shares]: "Partages",
    [IntegrationInsightType.GainedFollowers]: "Nouveaux abonnés",
    [IntegrationInsightType.TotalFollowers]: "Abonnés",
    [IntegrationInsightType.Impressions]: "Impressions",
    [IntegrationInsightType.Dislikes]: "Je n'aime pas",
    [IntegrationInsightType.ProfileLinksTaps]: "Clics liens profil",
    [IntegrationInsightType.Reach]: "Portée",
    [IntegrationInsightType.Videos]: "Vidéos",
};

export const integrationInsightTypeOptions = Object.values(IntegrationInsightType)
