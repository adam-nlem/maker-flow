import { ScriptGenerationStatus } from "./enums/ScriptGenerationStatus";
import { ScriptGoal } from "./enums/ScriptGoal";
import { OpeningStyle } from "./enums/OpeningStyle";
import { VideoDuration } from "./enums/VideoDuration";

export interface ScriptGenerationJSON {
    uuid: string;
    status: string;
    topic: string;
    goal: string;
    keyPoints?: string;
    openingStyle: string;
    duration: string;
    callToAction?: string;
    extraContext?: string;
    activeSkills: string[];
    skillInputs: Record<string, string>;
    errorMessage?: string;
    createdAt: string;
    completedAt?: string;
}

export class ScriptGeneration {
    constructor(
        public readonly uuid: string,
        public status: ScriptGenerationStatus,
        public readonly topic: string,
        public readonly goal: ScriptGoal,
        public readonly keyPoints: string | undefined,
        public readonly openingStyle: OpeningStyle,
        public readonly duration: VideoDuration,
        public readonly callToAction: string | undefined,
        public readonly extraContext: string | undefined,
        public readonly activeSkills: string[],
        public readonly skillInputs: Record<string, string>,
        public readonly errorMessage: string | undefined,
        public readonly createdAt: Date,
        public readonly completedAt?: Date,
    ) { }

    static fromJSON(json: ScriptGenerationJSON): ScriptGeneration {
        return new ScriptGeneration(
            json.uuid,
            json.status as ScriptGenerationStatus,
            json.topic,
            json.goal as ScriptGoal,
            json.keyPoints,
            json.openingStyle as OpeningStyle,
            json.duration as VideoDuration,
            json.callToAction,
            json.extraContext,
            json.activeSkills,
            json.skillInputs,
            json.errorMessage,
            new Date(json.createdAt),
            json.completedAt ? new Date(json.completedAt) : undefined,
        )
    }
}
