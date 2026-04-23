import type { ComponentType, SVGProps } from "react";
import { SparklesIcon, MagnifyingGlassIcon, LightBulbIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export enum ChatAction {
    GenerateScript = 'generate_script',
    AnalyzeScript = 'analyze_script',
    ImproveHook = 'improve_hook',
    FreeChat = 'free_chat',
}

export const chatActionOptions = Object.values(ChatAction);

export const chatActionToFrenchTranslation: Record<ChatAction, string> = {
    [ChatAction.GenerateScript]: "Créer un nouveau script",
    [ChatAction.AnalyzeScript]: "Analyser le script",
    [ChatAction.ImproveHook]: "Améliorer le hook",
    [ChatAction.FreeChat]: "Discussion libre",
};

export const chatActionToIcon: Record<ChatAction, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ChatAction.GenerateScript]: SparklesIcon,
    [ChatAction.AnalyzeScript]: MagnifyingGlassIcon,
    [ChatAction.ImproveHook]: LightBulbIcon,
    [ChatAction.FreeChat]: ChatBubbleLeftRightIcon,
};
