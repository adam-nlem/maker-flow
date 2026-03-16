import { Platform } from "./enums/Platform";
import { ContentType } from "./enums/ContentType";
import { Tone } from "./enums/Tone";

export interface CreatorProfileJSON {
    uuid: string;
    platforms?: string[];
    contentType?: string;
    niche?: string;
    targetAudience?: string;
    tones?: string[];
    signaturePhrases?: string[];
    neverList?: string[];
    styleSample?: string;
    createdAt: string;
    updatedAt?: string;
}

export class CreatorProfile {
    constructor(
        public readonly uuid: string,
        public platforms: Platform[],
        public contentType: ContentType | undefined,
        public niche: string | undefined,
        public targetAudience: string | undefined,
        public tones: Tone[],
        public signaturePhrases: string[],
        public neverList: string[],
        public styleSample: string | undefined,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: CreatorProfileJSON): CreatorProfile {
        return new CreatorProfile(
            json.uuid,
            (json.platforms ?? []) as Platform[],
            json.contentType ? json.contentType as ContentType : undefined,
            json.niche,
            json.targetAudience,
            (json.tones ?? []) as Tone[],
            json.signaturePhrases ?? [],
            json.neverList ?? [],
            json.styleSample,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }
}
