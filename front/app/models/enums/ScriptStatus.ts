import { ArrowPathIcon, CheckBadgeIcon, CheckCircleIcon, CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export enum ScriptStatus {
    Pending = 'pending',
    InProgress = 'in_progress',
    Completed = 'completed',
}

export const scriptStatusOptions = Object.values(ScriptStatus);

export const scriptStatusToFrenchTranslation: Record<ScriptStatus, string> = {
    [ScriptStatus.Pending]: "En attente",
    [ScriptStatus.InProgress]: "En cours",
    [ScriptStatus.Completed]: "Terminé",
}

export const scriptStatusToBgClass: Record<ScriptStatus, string> = {
    [ScriptStatus.Pending]: "bg-gray/10",
    [ScriptStatus.InProgress]: "bg-yellow/10",
    [ScriptStatus.Completed]: "bg-primary/10",
}

export const scriptStatusToBorderClass: Record<ScriptStatus, string> = {
    [ScriptStatus.Pending]: "border border-gray/30",
    [ScriptStatus.InProgress]: "border border-yellow/30",
    [ScriptStatus.Completed]: "border border-primary/30",
}

export const scriptStatusToTextClass: Record<ScriptStatus, string> = {
    [ScriptStatus.Pending]: "text-gray",
    [ScriptStatus.InProgress]: "text-yellow",
    [ScriptStatus.Completed]: "text-primary",
}

export const scriptStatusToIcon: Record<ScriptStatus, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ScriptStatus.Pending]: ClockIcon,
    [ScriptStatus.InProgress]: ArrowPathIcon,
    [ScriptStatus.Completed]: CheckCircleIcon,
};