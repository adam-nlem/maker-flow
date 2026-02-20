import { Post, type PostJSON } from "~/models/Post";

export interface PostRankingItemDTOJSON {
    post: PostJSON;
    score: number;
}

export class PostRankingItemDTO {
    constructor(
        public readonly post: Post,
        public readonly score: number,
    ) {}

    static fromJSON(json: PostRankingItemDTOJSON): PostRankingItemDTO {
        return new PostRankingItemDTO(
            Post.fromJSON(json.post),
            json.score,
        );
    }
}
