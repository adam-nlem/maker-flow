export interface PostDraftMediaVersionJSON {
    uuid: string;
    fileCount: number;
    createdAt: string;
}

export class PostDraftMediaVersion {
    constructor(
        public readonly uuid: string,
        public fileCount: number,
        public createdAt: string,
    ) { }

    static fromJSON(json: PostDraftMediaVersionJSON): PostDraftMediaVersion {
        return new PostDraftMediaVersion(
            json.uuid,
            json.fileCount,
            json.createdAt,
        );
    }

    toJSON(): PostDraftMediaVersionJSON {
        return {
            uuid: this.uuid,
            fileCount: this.fileCount,
            createdAt: this.createdAt,
        };
    }
}
