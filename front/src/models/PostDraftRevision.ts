import { PostDraftRevisionOptimizationStatus } from "./enums/PostDraftRevisionOptimizationStatus";

export interface PostDraftRevisionJSON {
    uuid: string;
    optimizationStatus: PostDraftRevisionOptimizationStatus;
    fileCount: number;
    createdAt: string;
}

export class PostDraftRevision {
    constructor(
        public readonly uuid: string,
        public optimizationStatus: PostDraftRevisionOptimizationStatus,
        public fileCount: number,
        public createdAt: string,
    ) { }

    static fromJSON(json: PostDraftRevisionJSON): PostDraftRevision {
        return new PostDraftRevision(
            json.uuid,
            json.optimizationStatus,
            json.fileCount,
            json.createdAt,
        );
    }

    toJSON(): PostDraftRevisionJSON {
        return {
            uuid: this.uuid,
            optimizationStatus: this.optimizationStatus,
            fileCount: this.fileCount,
            createdAt: this.createdAt,
        };
    }
}
