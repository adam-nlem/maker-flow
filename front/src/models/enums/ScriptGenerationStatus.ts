import { ArrowPathIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export enum ScriptGenerationStatus {
    Pending = 'pending',
    Processing = 'processing',
    Completed = 'completed',
    Failed = 'failed',
}

export const scriptGenerationStatusTranslationKeys: Record<ScriptGenerationStatus, string> = {
    [ScriptGenerationStatus.Pending]: "enums:scriptGenerationStatus.pending",
    [ScriptGenerationStatus.Processing]: "enums:scriptGenerationStatus.processing",
    [ScriptGenerationStatus.Completed]: "enums:scriptGenerationStatus.completed",
    [ScriptGenerationStatus.Failed]: "enums:scriptGenerationStatus.failed",
}

export const scriptGenerationStatusToBgClass: Record<ScriptGenerationStatus, string> = {
    [ScriptGenerationStatus.Pending]: "bg-yellow/10",
    [ScriptGenerationStatus.Processing]: "bg-blue/10",
    [ScriptGenerationStatus.Completed]: "bg-primary/10",
    [ScriptGenerationStatus.Failed]: "bg-red/10",
}

export const scriptGenerationStatusToBorderClass: Record<ScriptGenerationStatus, string> = {
    [ScriptGenerationStatus.Pending]: "border border-yellow/30",
    [ScriptGenerationStatus.Processing]: "border border-blue/30",
    [ScriptGenerationStatus.Completed]: "border border-primary/30",
    [ScriptGenerationStatus.Failed]: "border border-red/30",
}
export const scriptGenerationStatusToTextClass: Record<ScriptGenerationStatus, string> = {
    [ScriptGenerationStatus.Pending]: "text-yellow",
    [ScriptGenerationStatus.Processing]: "text-blue",
    [ScriptGenerationStatus.Completed]: "text-primary",
    [ScriptGenerationStatus.Failed]: "text-red",
}


export const scriptGenerationStatusToIcon: Record<ScriptGenerationStatus, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ScriptGenerationStatus.Pending]: ClockIcon,
    [ScriptGenerationStatus.Processing]: ArrowPathIcon,
    [ScriptGenerationStatus.Completed]: CheckCircleIcon,
    [ScriptGenerationStatus.Failed]: XCircleIcon,
};
