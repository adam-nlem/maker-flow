<?php

namespace App\Module\SocialAnalytics\Helper;

use App\Helper\DateHelper;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight\SocialAnalyticsIntegrationInsightTimelinePointDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight\SocialAnalyticsPostInsightTimelinePointDTO;

class TimelineGapFillerHelper
{
    /**
     * Fills missing hourly points between existing data points.
     * For each missing hour, copies the value from the previous point.
     *
     * @param SocialAnalyticsPostInsightTimelinePointDTO[] $points - sorted by hoursAfterPublication ASC
     * @return SocialAnalyticsPostInsightTimelinePointDTO[]
     */
    public static function fillPostInsightTimelinePointsHourlyGaps(array $points): array
    {
        if (count($points) <= 1) {
            return $points;
        }

        $pointsByHour = [];
        foreach ($points as $point) {
            $hour = (int) floor($point->getHoursAfterPublication());
            $pointsByHour[$hour] = $point;
        }

        $hours = array_keys($pointsByHour);
        $startHour = min($hours);
        $endHour = max($hours);

        $result = [];
        $previousPoint = null;

        for ($hour = $startHour; $hour <= $endHour; $hour++) {
            if (isset($pointsByHour[$hour])) {
                $result[] = $pointsByHour[$hour];
                $previousPoint = $pointsByHour[$hour];
            } elseif ($previousPoint !== null) {
                $result[] = new SocialAnalyticsPostInsightTimelinePointDTO(
                    hoursAfterPublication: (float) $hour,
                    value: $previousPoint->getValue(),
                    averageValue: $previousPoint->getAverageValue(),
                );
            }
        }

        return $result;
    }

    /**
     * Fills missing daily points between existing data points.
     * For each missing day, creates a synthetic point with the previous day's value.
     *
     * @param SocialAnalyticsIntegrationInsightTimelinePointDTO[] $points - sorted by createdAt ASC
     * @return SocialAnalyticsIntegrationInsightTimelinePointDTO[]
     */
    public static function fillIntegrationInsightTimelinePointsDailyGaps(array $points): array
    {
        if (count($points) <= 1) {
            return $points;
        }

        $pointsByDate = [];
        foreach ($points as $point) {
            $dateKey = $point->getCreatedAt()->format('Y-m-d');
            $pointsByDate[$dateKey] = $point;
        }

        $dates = array_keys($pointsByDate);
        $startDate = DateHelper::createUtcDateTimeImmutable(min($dates));
        $endDate = DateHelper::createUtcDateTimeImmutable(max($dates));

        $result = [];
        $previousPoint = null;
        $currentDate = $startDate;

        while ($currentDate <= $endDate) {
            $dateKey = $currentDate->format('Y-m-d');

            if (isset($pointsByDate[$dateKey])) {
                $result[] = $pointsByDate[$dateKey];
                $previousPoint = $pointsByDate[$dateKey];
            } elseif ($previousPoint !== null) {
                $result[] = new SocialAnalyticsIntegrationInsightTimelinePointDTO(
                    createdAt: $currentDate->setTime(0, 0, 0),
                    value: $previousPoint->getValue(),
                );
            }

            $currentDate = $currentDate->modify('+1 day');
        }

        return $result;
    }
}
