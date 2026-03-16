import type { PostInsightType } from "~/models/enums/PostInsightType";
import { PostInsightTimelinePointDTO, type PostInsightTimelinePointDTOJSON } from "./PostInsightTimelinePointDTO";

export interface PostInsightTimelineDTOJSON {
    type: PostInsightType;
    points: PostInsightTimelinePointDTOJSON[];
}

export class PostInsightTimelineDTO {
    constructor(
        public readonly type: PostInsightType,
        public readonly points: PostInsightTimelinePointDTO[],
    ) {}

    static fromJSON(json: PostInsightTimelineDTOJSON): PostInsightTimelineDTO {
        return new PostInsightTimelineDTO(
            json.type,
            json.points.map((point) => PostInsightTimelinePointDTO.fromJSON(point)),
        );
    }
}
