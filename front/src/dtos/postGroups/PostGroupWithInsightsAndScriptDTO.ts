import { PostGroup, type PostGroupJSON } from "~/models/PostGroup";
import { Script, type ScriptJSON } from "~/models/Script";
import type { PostInsightType } from "~/models/enums/PostInsightType";

export interface PostGroupWithInsightsAndScriptDTOJSON {
    postGroup: PostGroupJSON;
    aggregatedInsights: { type: PostInsightType; value: number }[];
    script: ScriptJSON | null;
    engagementByViews: number | null;
}

export class PostGroupWithInsightsAndScriptDTO {
    constructor(
        public readonly postGroup: PostGroup,
        public readonly aggregatedInsights: { type: PostInsightType; value: number }[],
        public readonly script: Script | null,
        public readonly engagementByViews: number | null,
    ) { }

    static fromJSON(json: PostGroupWithInsightsAndScriptDTOJSON): PostGroupWithInsightsAndScriptDTO {
        return new PostGroupWithInsightsAndScriptDTO(
            PostGroup.fromJSON(json.postGroup),
            json.aggregatedInsights,
            json.script ? Script.fromJSON(json.script) : null,
            json.engagementByViews,
        );
    }
}
