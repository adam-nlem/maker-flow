import type { SocialAnalyticsIntegrationInsightDailyPointsDTO } from "../dtos/socialAnalyticsIntegrationInsights/SocialAnalyticsIntegrationInsightDailyPointsDTO";
import type { SocialAnalyticsIntegrationInsightType } from "../models/enums/SocialAnalyticsIntegrationInsightType";

export function computeEvolutionPercentage(
    dailyPoints: SocialAnalyticsIntegrationInsightDailyPointsDTO[],
    type: SocialAnalyticsIntegrationInsightType,
    days: number,
): string | null {
    const typeData = dailyPoints.find((dp) => dp.type === type);
    if (!typeData || typeData.insights.length === 0) {
        return null;
    }

    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
    currentPeriodStart.setHours(0, 0, 0, 0);

    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

    const currentInsights = typeData.insights.filter(
        (i) => i.createdAt >= currentPeriodStart && i.createdAt <= now
    );
    const previousInsights = typeData.insights.filter(
        (i) => i.createdAt >= previousPeriodStart && i.createdAt < currentPeriodStart
    );

    if (currentInsights.length === 0) {
        return null;
    }

    const currentValue = currentInsights[currentInsights.length - 1].value;

    if (previousInsights.length === 0) {
        return null;
    }

    const previousValue = previousInsights[previousInsights.length - 1].value;

    if (previousValue === 0) {
        return null;
    }

    const percentage = Math.round(((currentValue - previousValue) / previousValue) * 1000) / 10;
    const sign = percentage >= 0 ? '+' : '';

    return `${sign}${percentage}%`;
}
