import { Tone } from "./enums/Tone";

export interface CreatorProfileJSON {
    uuid: string;
    niche?: string;
    tones?: string[];
    signaturePhrases?: string[];
    neverList?: string[];
    createdAt: string;
    updatedAt?: string;
}

export class CreatorProfile {
    constructor(
        public readonly uuid: string,
        public niche: string | undefined,
        public tones: Tone[],
        public signaturePhrases: string[],
        public neverList: string[],
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: CreatorProfileJSON): CreatorProfile {
        return new CreatorProfile(
            json.uuid,
            json.niche,
            (json.tones ?? []) as Tone[],
            json.signaturePhrases ?? [],
            json.neverList ?? [],
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }
}
