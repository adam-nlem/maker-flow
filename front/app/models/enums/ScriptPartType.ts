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

export const scriptPartTypeToBgClass: Record<ScriptPartType, string> = {
    [ScriptPartType.Text]: "bg-gray/10 border border-gray/30",
    [ScriptPartType.Chapter]: "bg-blue/10 border border-blue/30",
    [ScriptPartType.VoiceOver]: "bg-yellow/10 border border-yellow/30",
    [ScriptPartType.Dialogue]: "bg-purple/10 border border-purple/30",
    [ScriptPartType.Shot]: "bg-primary/10 border border-primary/30",
}

export const scriptPartTypeToTextClass: Record<ScriptPartType, string> = {
    [ScriptPartType.Text]: "text-gray",
    [ScriptPartType.Chapter]: "text-blue",
    [ScriptPartType.VoiceOver]: "text-yellow",
    [ScriptPartType.Dialogue]: "text-purple",
    [ScriptPartType.Shot]: "text-primary",
}
