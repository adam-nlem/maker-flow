import { ScriptStatus } from "./ScriptStatus";

export enum ScriptStatusGroup {
    Idea = 'idea',
    InProgress = 'in_progress',
    Done = 'done',
}

export const scriptStatusGroupOptions = [
    ScriptStatusGroup.Idea,
    ScriptStatusGroup.InProgress,
    ScriptStatusGroup.Done,
];

export const scriptStatusToGroup: Record<ScriptStatus, ScriptStatusGroup> = {
    [ScriptStatus.Published]: ScriptStatusGroup.Done,
    [ScriptStatus.Scripting]: ScriptStatusGroup.InProgress,
    [ScriptStatus.Shooting]: ScriptStatusGroup.InProgress,
    [ScriptStatus.Editing]: ScriptStatusGroup.InProgress,
    [ScriptStatus.Scheduled]: ScriptStatusGroup.InProgress,
    [ScriptStatus.Idea]: ScriptStatusGroup.Idea,
};


export const scriptStatusGroupToFrenchTranslation: Record<ScriptStatusGroup, string> = {
    [ScriptStatusGroup.Idea]: 'Idées',
    [ScriptStatusGroup.InProgress]: 'En cours',
    [ScriptStatusGroup.Done]: 'Terminés',
};

export const scriptStatusGroupToBgClass: Record<ScriptStatusGroup, string> = {
    [ScriptStatusGroup.Idea]: 'bg-purple/10',
    [ScriptStatusGroup.InProgress]: 'bg-yellow/10',
    [ScriptStatusGroup.Done]: 'bg-green/10',
};

export const scriptStatusGroupToBgFullClass: Record<ScriptStatusGroup, string> = {
    [ScriptStatusGroup.Idea]: 'bg-purple',
    [ScriptStatusGroup.InProgress]: 'bg-yellow',
    [ScriptStatusGroup.Done]: 'bg-green',
};

export const scriptStatusGroupToTextClass: Record<ScriptStatusGroup, string> = {
    [ScriptStatusGroup.Idea]: 'text-purple',
    [ScriptStatusGroup.InProgress]: 'text-yellow',
    [ScriptStatusGroup.Done]: 'text-green',
};
