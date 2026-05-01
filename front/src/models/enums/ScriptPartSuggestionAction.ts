import type { ComponentType, SVGProps } from "react";
import { ArrowPathIcon, ArrowsUpDownIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export enum ScriptPartSuggestionAction {
    Rewrite = 'rewrite',
    Insert = 'insert',
    Delete = 'delete',
    Reorder = 'reorder',
}

export const scriptPartSuggestionActionOptions = Object.values(ScriptPartSuggestionAction);

export const scriptPartSuggestionActionTranslationKeys: Record<ScriptPartSuggestionAction, string> = {
    [ScriptPartSuggestionAction.Rewrite]: "enums:scriptPartSuggestionAction.rewrite",
    [ScriptPartSuggestionAction.Insert]: "enums:scriptPartSuggestionAction.insert",
    [ScriptPartSuggestionAction.Delete]: "enums:scriptPartSuggestionAction.delete",
    [ScriptPartSuggestionAction.Reorder]: "enums:scriptPartSuggestionAction.reorder",
}

export const scriptPartSuggestionActionToIcon: Record<ScriptPartSuggestionAction, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ScriptPartSuggestionAction.Rewrite]: ArrowPathIcon,
    [ScriptPartSuggestionAction.Insert]: PlusIcon,
    [ScriptPartSuggestionAction.Delete]: TrashIcon,
    [ScriptPartSuggestionAction.Reorder]: ArrowsUpDownIcon,
}
