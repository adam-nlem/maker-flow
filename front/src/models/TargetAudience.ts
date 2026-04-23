export interface TargetAudienceJSON {
    uuid: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export class TargetAudience {
    constructor(
        public readonly uuid: string,
        public name: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static fromJSON(json: TargetAudienceJSON): TargetAudience {
        return new TargetAudience(
            json.uuid,
            json.name,
            new Date(json.createdAt),
            new Date(json.updatedAt),
        );
    }
}
