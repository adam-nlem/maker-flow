import type { SocialAnalyticsIntegrationInsightTimelineDTO } from "../dtos/socialAnalyticsIntegrationInsights/SocialAnalyticsIntegrationInsightTimelineDTO";
import type { SocialAnalyticsIntegrationInsightType } from "../models/enums/SocialAnalyticsIntegrationInsightType";

export function computeEvolutionPercentage(
    timelines: SocialAnalyticsIntegrationInsightTimelineDTO[],
    type: SocialAnalyticsIntegrationInsightType,
    days: number,
): string | null {
    const timeline = timelines.find((t) => t.type === type);
    if (!timeline || timeline.points.length === 0) {
        return null;
    }

    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
    currentPeriodStart.setHours(0, 0, 0, 0);

    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

    const currentPoints = timeline.points.filter(
        (p) => p.createdAt >= currentPeriodStart && p.createdAt <= now
    );
    const previousPoints = timeline.points.filter(
        (p) => p.createdAt >= previousPeriodStart && p.createdAt < currentPeriodStart
    );

    if (currentPoints.length === 0) {
        return null;
    }

    const currentValue = currentPoints[currentPoints.length - 1].value;

    if (previousPoints.length === 0) {
        return null;
    }

    const previousValue = previousPoints[previousPoints.length - 1].value;

    if (previousValue === 0) {
        return null;
    }

    const percentage = Math.round(((currentValue - previousValue) / previousValue) * 1000) / 10;
    const sign = percentage >= 0 ? '+' : '';

    return `${sign}${percentage}%`;
}
