import type { ComponentType, SVGProps } from "react";
import { ArrowPathIcon, ArrowsUpDownIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export enum ScriptPartSuggestionAction {
    Rewrite = 'rewrite',
    Insert = 'insert',
    Delete = 'delete',
    Reorder = 'reorder',
}

export const scriptPartSuggestionActionOptions = Object.values(ScriptPartSuggestionAction);

export const scriptPartSuggestionActionToFrenchTranslation: Record<ScriptPartSuggestionAction, string> = {
    [ScriptPartSuggestionAction.Rewrite]: "Réécriture suggérée",
    [ScriptPartSuggestionAction.Insert]: "Insertion suggérée",
    [ScriptPartSuggestionAction.Delete]: "Suppression suggérée",
    [ScriptPartSuggestionAction.Reorder]: "Repositionnement suggéré",
}

export const scriptPartSuggestionActionToIcon: Record<ScriptPartSuggestionAction, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ScriptPartSuggestionAction.Rewrite]: ArrowPathIcon,
    [ScriptPartSuggestionAction.Insert]: PlusIcon,
    [ScriptPartSuggestionAction.Delete]: TrashIcon,
    [ScriptPartSuggestionAction.Reorder]: ArrowsUpDownIcon,
}
