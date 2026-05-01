import { ScriptPartSuggestionAction } from "./enums/ScriptPartSuggestionAction";
import { ScriptPartSuggestionStatus } from "./enums/ScriptPartSuggestionStatus";
import { ScriptPartType } from "./enums/ScriptPartType";

export interface ScriptPartSuggestionJSON {
    uuid: string;
    action: ScriptPartSuggestionAction;
    status: ScriptPartSuggestionStatus;
    originalContent: string | null;
    proposedContent: string | null;
    proposedType: ScriptPartType | null;
    proposedPosition: number | null;
    scriptPartUuid: string | null;
    messageUuid: string | null;
    createdAt: string;
    updatedAt: string;
}

export class ScriptPartSuggestion {
    constructor(
        public readonly uuid: string,
        public readonly action: ScriptPartSuggestionAction,
        public status: ScriptPartSuggestionStatus,
        public readonly originalContent: string | null,
        public readonly proposedContent: string | null,
        public readonly proposedType: ScriptPartType | null,
        public readonly proposedPosition: number | null,
        public readonly scriptPartUuid: string | null,
        public readonly messageUuid: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static fromJSON(json: ScriptPartSuggestionJSON): ScriptPartSuggestion {
        return new ScriptPartSuggestion(
            json.uuid,
            json.action,
            json.status,
            json.originalContent,
            json.proposedContent,
            json.proposedType,
            json.proposedPosition,
            json.scriptPartUuid,
            json.messageUuid,
            new Date(json.createdAt),
            new Date(json.updatedAt),
        );
    }

    get isPending(): boolean {
        return this.status === ScriptPartSuggestionStatus.Pending;
    }
}
