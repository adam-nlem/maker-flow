import type { ComponentType, SVGProps } from "react";
import { ClockIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export enum ScriptVersionStatus {
    Draft = 'draft',
    Accepted = 'accepted',
    Rejected = 'rejected',
}

export const scriptVersionStatusOptions = Object.values(ScriptVersionStatus);

export const scriptVersionStatusToFrenchTranslation: Record<ScriptVersionStatus, string> = {
    [ScriptVersionStatus.Draft]: "Brouillon",
    [ScriptVersionStatus.Accepted]: "Accepté",
    [ScriptVersionStatus.Rejected]: "Rejeté",
};

export const scriptVersionStatusToBgClass: Record<ScriptVersionStatus, string> = {
    [ScriptVersionStatus.Draft]: "bg-yellow/10",
    [ScriptVersionStatus.Accepted]: "bg-primary/10",
    [ScriptVersionStatus.Rejected]: "bg-red/10",
};

export const scriptVersionStatusToBorderClass: Record<ScriptVersionStatus, string> = {
    [ScriptVersionStatus.Draft]: "border border-yellow/30",
    [ScriptVersionStatus.Accepted]: "border border-primary/30",
    [ScriptVersionStatus.Rejected]: "border border-red/30",
};

export const scriptVersionStatusToTextClass: Record<ScriptVersionStatus, string> = {
    [ScriptVersionStatus.Draft]: "text-yellow",
    [ScriptVersionStatus.Accepted]: "text-primary",
    [ScriptVersionStatus.Rejected]: "text-red",
};

export const scriptVersionStatusToIcon: Record<ScriptVersionStatus, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ScriptVersionStatus.Draft]: ClockIcon,
    [ScriptVersionStatus.Accepted]: CheckCircleIcon,
    [ScriptVersionStatus.Rejected]: XCircleIcon,
};
