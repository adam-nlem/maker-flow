import type { PostInsightJSON } from "~/models/PostInsight";
import { PostInsight } from "~/models/PostInsight";

export interface PostInsightWithEvolutionDTOJSON {
    insight: PostInsightJSON;
    evolutionPercentage: string | null;
}

export class PostInsightWithEvolutionDTO {
    constructor(
        public readonly insight: PostInsight,
        public readonly evolutionPercentage: string | null,
    ) { }

    static fromJSON(json: PostInsightWithEvolutionDTOJSON): PostInsightWithEvolutionDTO {
        return new PostInsightWithEvolutionDTO(
            PostInsight.fromJSON(json.insight),
            json.evolutionPercentage,
        );
    }
}
