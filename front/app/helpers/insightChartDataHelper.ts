import { type ChartDataPoint, fillDailyDataPoints, filterDataPointsByDays } from "~/utils/chartDataHelpers";
import type { IntegrationInsightTimelineDTO } from "~/dtos/integrationInsights/IntegrationInsightTimelineDTO";
import type { IntegrationInsightTimelinePointDTO } from "~/dtos/integrationInsights/IntegrationInsightTimelinePointDTO";
import type { IntegrationInsightType } from "~/models/enums/IntegrationInsightType";

export function getChartDataForInsightType(
    timelines: IntegrationInsightTimelineDTO[],
    type: IntegrationInsightType,
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
    timelines: IntegrationInsightTimelineDTO[],
    type: IntegrationInsightType,
    days: number,
): IntegrationInsightTimelinePointDTO[] {
    const timeline = timelines.find((t) => t.type === type);
    if (!timeline) return [];

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);

    return timeline.points.filter((p) => p.createdAt >= cutoff);
}

export function computeTotalValue(points: IntegrationInsightTimelinePointDTO[]): number {
    return points.reduce((sum, p) => sum + p.value, 0);
}
