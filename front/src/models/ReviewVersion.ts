import { ReviewStatus } from "./enums/ReviewStatus";

export interface ReviewVersionJSON {
    uuid: string;
    fileCount: number;
    status: ReviewStatus;
    createdAt?: string;
}

export class ReviewVersion {
    constructor(
        public readonly uuid: string,
        public fileCount: number,
        public status: ReviewStatus,
        public createdAt: string | null,
    ) { }

    static fromJSON(json: ReviewVersionJSON): ReviewVersion {
        return new ReviewVersion(
            json.uuid,
            json.fileCount,
            json.status,
            json.createdAt ?? null,
        );
    }

    toJSON(): ReviewVersionJSON {
        return {
            uuid: this.uuid,
            fileCount: this.fileCount,
            status: this.status,
            createdAt: this.createdAt ?? undefined,
        };
    }
}
