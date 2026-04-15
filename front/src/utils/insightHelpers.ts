import type { IntegrationInsightWithEvolutionDTO } from "~/dtos/integrationInsights/IntegrationInsightWithEvolutionDTO";
import { IntegrationInsightType } from "~/models/enums/IntegrationInsightType";

export function getInsightValue(insights: IntegrationInsightWithEvolutionDTO[], type: IntegrationInsightType): number {
    return insights.find((i) => i.type === type)?.value ?? 0;
}

export function computeEngagementRate(insights: IntegrationInsightWithEvolutionDTO[]): number | null {
    const views = getInsightValue(insights, IntegrationInsightType.Views);
    if (views === 0) return null;

    const interactions =
        getInsightValue(insights, IntegrationInsightType.Likes) +
        getInsightValue(insights, IntegrationInsightType.Comments) +
        getInsightValue(insights, IntegrationInsightType.Shares) +
        getInsightValue(insights, IntegrationInsightType.Saves);

    return Math.round((interactions / views) * 1000) / 10;
}
