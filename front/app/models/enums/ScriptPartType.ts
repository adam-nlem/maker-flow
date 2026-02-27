import type { ComponentType, SVGProps } from "react";
import { Bars3BottomLeftIcon, DocumentTextIcon, MicrophoneIcon, ChatBubbleLeftRightIcon, FilmIcon, MegaphoneIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export enum ScriptPartType {
    Text = 'text',
    Chapter = 'chapter',
    VoiceOver = 'voice_over',
    Dialogue = 'dialogue',
    Shot = 'shot',
    CallToAction = 'call_to_action',
    RetentionCue = 'retention_cue',
}

export const scriptPartTypeToFrenchTranslation: Record<ScriptPartType, string> = {
    [ScriptPartType.Text]: "Texte",
    [ScriptPartType.Chapter]: "Chapitre",
    [ScriptPartType.VoiceOver]: "Voix off",
    [ScriptPartType.Dialogue]: "Dialogue",
    [ScriptPartType.Shot]: "Plan",
    [ScriptPartType.CallToAction]: "Appel à l'action",
    [ScriptPartType.RetentionCue]: "Signal de rétention",
}

export const scriptPartTypeToIcon: Record<ScriptPartType, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ScriptPartType.Text]: Bars3BottomLeftIcon,
    [ScriptPartType.Chapter]: DocumentTextIcon,
    [ScriptPartType.VoiceOver]: MicrophoneIcon,
    [ScriptPartType.Dialogue]: ChatBubbleLeftRightIcon,
    [ScriptPartType.Shot]: FilmIcon,
    [ScriptPartType.CallToAction]: MegaphoneIcon,
    [ScriptPartType.RetentionCue]: ArrowPathIcon,
}

export const scriptPartTypeToBgClass: Record<ScriptPartType, string> = {
    [ScriptPartType.Text]: "bg-gray/10",
    [ScriptPartType.Chapter]: "bg-blue/10",
    [ScriptPartType.VoiceOver]: "bg-yellow/10",
    [ScriptPartType.Dialogue]: "bg-purple/10",
    [ScriptPartType.Shot]: "bg-primary/10",
    [ScriptPartType.CallToAction]: "bg-orange/10",
    [ScriptPartType.RetentionCue]: "bg-pink/10",
}

export const scriptPartTypeToBorderClass: Record<ScriptPartType, string> = {
    [ScriptPartType.Text]: "border border-gray/30",
    [ScriptPartType.Chapter]: "border border-blue/30",
    [ScriptPartType.VoiceOver]: "border border-yellow/30",
    [ScriptPartType.Dialogue]: "border border-purple/30",
    [ScriptPartType.Shot]: "border border-primary/30",
    [ScriptPartType.CallToAction]: "border border-orange/30",
    [ScriptPartType.RetentionCue]: "border border-pink/30",
}

export const scriptPartTypeToTextClass: Record<ScriptPartType, string> = {
    [ScriptPartType.Text]: "text-gray",
    [ScriptPartType.Chapter]: "text-blue",
    [ScriptPartType.VoiceOver]: "text-yellow",
    [ScriptPartType.Dialogue]: "text-purple",
    [ScriptPartType.Shot]: "text-primary",
    [ScriptPartType.CallToAction]: "text-orange",
    [ScriptPartType.RetentionCue]: "text-pink",
}
