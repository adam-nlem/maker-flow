import { ArrowPathIcon, CheckBadgeIcon, CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export enum ScriptStatus {
    Pending = 'pending',
    InProgress = 'in_progress',
    Completed = 'completed',
}

export const scriptStatusOptions = Object.values(ScriptStatus);

export const scriptStatusToLabel: Record<ScriptStatus, string> = {
    [ScriptStatus.Pending]: "En attente",
    [ScriptStatus.InProgress]: "En cours",
    [ScriptStatus.Completed]: "Terminé",
}

export const scriptStatusToBgClass: Record<ScriptStatus, string> = {
    [ScriptStatus.Pending]: "bg-green/30",
    [ScriptStatus.InProgress]: "bg-yellow/30",
    [ScriptStatus.Completed]: "bg-purple/30",
}

export const scriptStatusToTextClass: Record<ScriptStatus, string> = {
    [ScriptStatus.Pending]: "text-green",
    [ScriptStatus.InProgress]: "text-yellow",
    [ScriptStatus.Completed]: "text-purple",
}

export const scriptStatusToIcon: Record<ScriptStatus, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ScriptStatus.Pending]: ClockIcon,
    [ScriptStatus.InProgress]: ArrowPathIcon,
    [ScriptStatus.Completed]: CheckIcon,
};