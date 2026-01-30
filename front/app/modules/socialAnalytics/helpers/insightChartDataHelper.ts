import { type ChartDataPoint, fillDailyDataPoints, filterDataPointsByDays } from "~/utils/chartDataHelpers";
import type { SocialAnalyticsIntegrationInsightDailyPointsDTO } from "../dtos/socialAnalyticsIntegrationInsights/SocialAnalyticsIntegrationInsightDailyPointsDTO";
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

    console.log("filled data", filled)

    const filtered = filterDataPointsByDays(filled, days);
    console.log("filtered data", filtered)
    return filtered;
}
