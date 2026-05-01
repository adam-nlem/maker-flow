import { MessageType } from "./enums/MessageType";

export interface ChatMessageJSON {
    uuid: string;
    content: string;
    type: string;
    suggestedAnswers: string[] | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
}

export class ChatMessage {
    constructor(
        public readonly uuid: string,
        public content: string,
        public readonly type: MessageType,
        public readonly suggestedAnswers: string[],
        public readonly metadata: Record<string, unknown> | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static fromJSON(json: ChatMessageJSON): ChatMessage {
        return new ChatMessage(
            json.uuid,
            json.content,
            json.type as MessageType,
            json.suggestedAnswers ?? [],
            json.metadata,
            new Date(json.createdAt),
            new Date(json.updatedAt),
        );
    }

    get suggestionUuids(): string[] {
        const raw = this.metadata?.suggestionUuids;
        return Array.isArray(raw) ? (raw as string[]) : [];
    }
}
