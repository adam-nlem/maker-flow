import { type ChartDataPoint, fillDailyDataPoints, filterDataPointsByDays } from "~/utils/chartDataHelpers";
import type { SocialAnalyticsIntegrationInsightDailyPointsDTO } from "../dtos/socialAnalyticsIntegrationInsights/SocialAnalyticsIntegrationInsightDailyPointsDTO";
import type { SocialAnalyticsIntegrationInsight } from "../models/SocialAnalyticsIntegrationInsight";
import type { SocialAnalyticsIntegrationInsightType } from "../models/enums/SocialAnalyticsIntegrationInsightType";

export function getChartDataForInsightType(
    dailyPoints: SocialAnalyticsIntegrationInsightDailyPointsDTO[],
    type: SocialAnalyticsIntegrationInsightType,
    days: number,
): ChartDataPoint[] {
    const dailyPoint = dailyPoints.find((dp) => dp.type === type);
    if (!dailyPoint) {
        return [];
    }

    const filled = fillDailyDataPoints(
        dailyPoint.insights.map((insight) => ({
            date: insight.createdAt,
            value: insight.value,
        }))
    );
    return filterDataPointsByDays(filled, days);
}

export function getFilteredInsightsForType(
    dailyPoints: SocialAnalyticsIntegrationInsightDailyPointsDTO[],
    type: SocialAnalyticsIntegrationInsightType,
    days: number,
): SocialAnalyticsIntegrationInsight[] {
    const dailyPoint = dailyPoints.find((dp) => dp.type === type);
    if (!dailyPoint) return [];

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);

    return dailyPoint.insights.filter((i) => i.createdAt >= cutoff);
}

export function computeTotalValue(insights: SocialAnalyticsIntegrationInsight[]): number {
    return insights.reduce((sum, i) => sum + i.value, 0);
}
