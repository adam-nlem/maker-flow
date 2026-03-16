import { CalendarDaysIcon, CheckBadgeIcon, LightBulbIcon, PencilSquareIcon, ScissorsIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export enum ScriptStatus {
    Idea = 'idea',
    Scripting = 'scripting',
    Shooting = 'shooting',
    Editing = 'editing',
    Scheduled = 'scheduled',
    Published = 'published',
}

export const scriptStatusOptions = Object.values(ScriptStatus);

export const scriptStatusToFrenchTranslation: Record<ScriptStatus, string> = {
    [ScriptStatus.Idea]: 'Idée',
    [ScriptStatus.Scripting]: 'Écriture du Script',
    [ScriptStatus.Shooting]: 'Tournage',
    [ScriptStatus.Editing]: 'Montage',
    [ScriptStatus.Scheduled]: 'Planifié',
    [ScriptStatus.Published]: 'Publié',
}

export const scriptStatusToBgClass: Record<ScriptStatus, string> = {
    [ScriptStatus.Idea]: "bg-gray/10",
    [ScriptStatus.Scripting]: "bg-purple/10",
    [ScriptStatus.Shooting]: "bg-blue/10",
    [ScriptStatus.Editing]: "bg-yellow/10",
    [ScriptStatus.Scheduled]: "bg-green/10",
    [ScriptStatus.Published]: "bg-primary/10",
}

export const scriptStatusToBorderClass: Record<ScriptStatus, string> = {
    [ScriptStatus.Idea]: "border border-gray/30",
    [ScriptStatus.Scripting]: "border border-purple/30",
    [ScriptStatus.Shooting]: "border border-blue/30",
    [ScriptStatus.Editing]: "border border-yellow/30",
    [ScriptStatus.Scheduled]: "border border-green/30",
    [ScriptStatus.Published]: "border border-primary/30",
}

export const scriptStatusToTextClass: Record<ScriptStatus, string> = {
    [ScriptStatus.Idea]: "text-gray",
    [ScriptStatus.Scripting]: "text-purple",
    [ScriptStatus.Shooting]: "text-blue",
    [ScriptStatus.Editing]: "text-yellow",
    [ScriptStatus.Scheduled]: "text-green",
    [ScriptStatus.Published]: "text-primary",
}

export const scriptStatusToIcon: Record<ScriptStatus, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ScriptStatus.Idea]: LightBulbIcon,
    [ScriptStatus.Scripting]: PencilSquareIcon,
    [ScriptStatus.Shooting]: VideoCameraIcon,
    [ScriptStatus.Editing]: ScissorsIcon,
    [ScriptStatus.Scheduled]: CalendarDaysIcon,
    [ScriptStatus.Published]: CheckBadgeIcon,
};