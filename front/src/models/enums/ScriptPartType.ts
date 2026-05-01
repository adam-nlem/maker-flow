import type { ComponentType, SVGProps } from "react";
import { Bars3BottomLeftIcon, DocumentTextIcon, MicrophoneIcon, ChatBubbleLeftRightIcon, FilmIcon, MegaphoneIcon, ArrowPathIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

export enum ScriptPartType {
    Hook = 'hook',
    Text = 'text',
    Chapter = 'chapter',
    VoiceOver = 'voice_over',
    Dialogue = 'dialogue',
    Shot = 'shot',
    CallToAction = 'call_to_action',
    RetentionCue = 'retention_cue',
}

export const scriptPartTypeTranslationKeys: Record<ScriptPartType, string> = {
    [ScriptPartType.Hook]: "enums:scriptPartType.hook",
    [ScriptPartType.Text]: "enums:scriptPartType.text",
    [ScriptPartType.Chapter]: "enums:scriptPartType.chapter",
    [ScriptPartType.VoiceOver]: "enums:scriptPartType.voiceOver",
    [ScriptPartType.Dialogue]: "enums:scriptPartType.dialogue",
    [ScriptPartType.Shot]: "enums:scriptPartType.shot",
    [ScriptPartType.CallToAction]: "enums:scriptPartType.callToAction",
    [ScriptPartType.RetentionCue]: "enums:scriptPartType.retentionCue",
}

export const scriptPartTypeToIcon: Record<ScriptPartType, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ScriptPartType.Hook]: CheckBadgeIcon,
    [ScriptPartType.Text]: Bars3BottomLeftIcon,
    [ScriptPartType.Chapter]: DocumentTextIcon,
    [ScriptPartType.VoiceOver]: MicrophoneIcon,
    [ScriptPartType.Dialogue]: ChatBubbleLeftRightIcon,
    [ScriptPartType.Shot]: FilmIcon,
    [ScriptPartType.CallToAction]: MegaphoneIcon,
    [ScriptPartType.RetentionCue]: ArrowPathIcon,
}

export const scriptPartTypeToBgClass: Record<ScriptPartType, string> = {
    [ScriptPartType.Hook]: "bg-red/10",
    [ScriptPartType.Text]: "bg-gray/10",
    [ScriptPartType.Chapter]: "bg-blue/10",
    [ScriptPartType.VoiceOver]: "bg-yellow/10",
    [ScriptPartType.Dialogue]: "bg-purple/10",
    [ScriptPartType.Shot]: "bg-primary/10",
    [ScriptPartType.CallToAction]: "bg-orange/10",
    [ScriptPartType.RetentionCue]: "bg-pink/10",
}

export const scriptPartTypeToBorderClass: Record<ScriptPartType, string> = {
    [ScriptPartType.Hook]: "border border-red/30",
    [ScriptPartType.Text]: "border border-gray/30",
    [ScriptPartType.Chapter]: "border border-blue/30",
    [ScriptPartType.VoiceOver]: "border border-yellow/30",
    [ScriptPartType.Dialogue]: "border border-purple/30",
    [ScriptPartType.Shot]: "border border-primary/30",
    [ScriptPartType.CallToAction]: "border border-orange/30",
    [ScriptPartType.RetentionCue]: "border border-pink/30",
}

export const scriptPartTypeToTextClass: Record<ScriptPartType, string> = {
    [ScriptPartType.Hook]: "text-red",
    [ScriptPartType.Text]: "text-gray",
    [ScriptPartType.Chapter]: "text-blue",
    [ScriptPartType.VoiceOver]: "text-yellow",
    [ScriptPartType.Dialogue]: "text-purple",
    [ScriptPartType.Shot]: "text-primary",
    [ScriptPartType.CallToAction]: "text-orange",
    [ScriptPartType.RetentionCue]: "text-pink",
}

export const scriptPartTypeOptions = Object.values(ScriptPartType);
