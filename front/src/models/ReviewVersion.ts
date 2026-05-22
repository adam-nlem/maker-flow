import { ReviewStatus } from "./enums/ReviewStatus";
import { VideoStreamingStatus } from "./enums/VideoStreamingStatus";

export interface ReviewVersionJSON {
    uuid: string;
    fileCount: number;
    status: ReviewStatus;
    videoStreamingStatus?: VideoStreamingStatus | null;
    createdAt?: string;
}

export class ReviewVersion {
    constructor(
        public readonly uuid: string,
        public fileCount: number,
        public status: ReviewStatus,
        public videoStreamingStatus: VideoStreamingStatus | null,
        public createdAt: string | null,
    ) { }

    static fromJSON(json: ReviewVersionJSON): ReviewVersion {
        return new ReviewVersion(
            json.uuid,
            json.fileCount,
            json.status,
            json.videoStreamingStatus ?? null,
            json.createdAt ?? null,
        );
    }

    toJSON(): ReviewVersionJSON {
        return {
            uuid: this.uuid,
            fileCount: this.fileCount,
            status: this.status,
            videoStreamingStatus: this.videoStreamingStatus,
            createdAt: this.createdAt ?? undefined,
        };
    }
}
