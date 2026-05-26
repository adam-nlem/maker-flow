export interface AgencyUsageDTOJSON {
    editorCollaboratorsUsed: number;
    editorCollaboratorsLimit: number | null;
    videoSecondsUsed: number;
    videoSecondsLimit: number | null;
    storageBytesUsed: number;
    storageBytesLimit: number | null;
}

export class AgencyUsageDTO {
    constructor(
        public readonly editorCollaboratorsUsed: number,
        public readonly editorCollaboratorsLimit: number | null,
        public readonly videoSecondsUsed: number,
        public readonly videoSecondsLimit: number | null,
        public readonly storageBytesUsed: number,
        public readonly storageBytesLimit: number | null,
    ) {}

    static fromJSON(json: AgencyUsageDTOJSON): AgencyUsageDTO {
        return new AgencyUsageDTO(
            json.editorCollaboratorsUsed,
            json.editorCollaboratorsLimit,
            json.videoSecondsUsed,
            json.videoSecondsLimit,
            json.storageBytesUsed,
            json.storageBytesLimit,
        );
    }
}
