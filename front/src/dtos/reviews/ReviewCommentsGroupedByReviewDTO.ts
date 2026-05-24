import { ReviewComment, type ReviewCommentJSON } from "~/models/ReviewComment";
import {
    ReviewWithLatestVersionDTO,
    type ReviewWithLatestVersionDTOJSON,
} from "./ReviewWithLatestVersionDTO";

export interface ReviewCommentsGroupedByReviewDTOJSON {
    review: ReviewWithLatestVersionDTOJSON;
    comments: ReviewCommentJSON[];
}

export class ReviewCommentsGroupedByReviewDTO {
    constructor(
        public readonly review: ReviewWithLatestVersionDTO,
        public readonly comments: ReviewComment[],
    ) { }

    static fromJSON(json: ReviewCommentsGroupedByReviewDTOJSON): ReviewCommentsGroupedByReviewDTO {
        return new ReviewCommentsGroupedByReviewDTO(
            ReviewWithLatestVersionDTO.fromJSON(json.review),
            (json.comments ?? []).map(ReviewComment.fromJSON),
        );
    }
}
