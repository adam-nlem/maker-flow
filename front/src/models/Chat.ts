import { AiModel } from "./enums/AiModel";

export interface ChatJSON {
    uuid: string;
    title: string | null;
    aiModel: string;
    createdAt: string;
    updatedAt: string;
}

export class Chat {
    constructor(
        public readonly uuid: string,
        public title: string | null,
        public readonly aiModel: AiModel,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static fromJSON(json: ChatJSON): Chat {
        return new Chat(
            json.uuid,
            json.title,
            json.aiModel as AiModel,
            new Date(json.createdAt),
            new Date(json.updatedAt),
        );
    }
}
