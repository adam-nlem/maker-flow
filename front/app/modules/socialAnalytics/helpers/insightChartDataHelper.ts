import { type ChartDataPoint, fillDailyDataPoints, filterDataPointsByDays } from "~/utils/chartDataHelpers";
import type { SocialAnalyticsIntegrationInsightTimelineDTO } from "../dtos/socialAnalyticsIntegrationInsights/SocialAnalyticsIntegrationInsightTimelineDTO";
import type { SocialAnalyticsIntegrationInsightTimelinePointDTO } from "../dtos/socialAnalyticsIntegrationInsights/SocialAnalyticsIntegrationInsightTimelinePointDTO";
import type { SocialAnalyticsIntegrationInsightType } from "../models/enums/SocialAnalyticsIntegrationInsightType";

export function getChartDataForInsightType(
    timelines: SocialAnalyticsIntegrationInsightTimelineDTO[],
    type: SocialAnalyticsIntegrationInsightType,
    days: number,
): ChartDataPoint[] {
    const timeline = timelines.find((t) => t.type === type);
    if (!timeline) {
        return [];
    }

    const filled = fillDailyDataPoints(
        timeline.points.map((point) => ({
            date: point.createdAt,
            value: point.value,
        }))
    );
    return filterDataPointsByDays(filled, days);
}

export function getFilteredPointsForType(
    timelines: SocialAnalyticsIntegrationInsightTimelineDTO[],
    type: SocialAnalyticsIntegrationInsightType,
    days: number,
): SocialAnalyticsIntegrationInsightTimelinePointDTO[] {
    const timeline = timelines.find((t) => t.type === type);
    if (!timeline) return [];

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);

    return timeline.points.filter((p) => p.createdAt >= cutoff);
}

export function computeTotalValue(points: SocialAnalyticsIntegrationInsightTimelinePointDTO[]): number {
    return points.reduce((sum, p) => sum + p.value, 0);
}
