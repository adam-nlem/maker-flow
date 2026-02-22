import type { ComponentType, SVGProps } from "react";
import { Bars3BottomLeftIcon, DocumentTextIcon, MicrophoneIcon, ChatBubbleLeftRightIcon, FilmIcon } from "@heroicons/react/24/outline";

export enum ScriptPartType {
    Text = 'text',
    Chapter = 'chapter',
    VoiceOver = 'voice_over',
    Dialogue = 'dialogue',
    Shot = 'shot',
}

export const scriptPartTypeToFrenchTranslation: Record<ScriptPartType, string> = {
    [ScriptPartType.Text]: "Texte",
    [ScriptPartType.Chapter]: "Chapitre",
    [ScriptPartType.VoiceOver]: "Voix off",
    [ScriptPartType.Dialogue]: "Dialogue",
    [ScriptPartType.Shot]: "Plan",
}

export const scriptPartTypeToIcon: Record<ScriptPartType, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ScriptPartType.Text]: Bars3BottomLeftIcon,
    [ScriptPartType.Chapter]: DocumentTextIcon,
    [ScriptPartType.VoiceOver]: MicrophoneIcon,
    [ScriptPartType.Dialogue]: ChatBubbleLeftRightIcon,
    [ScriptPartType.Shot]: FilmIcon,
}
