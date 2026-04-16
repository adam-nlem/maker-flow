<?php

namespace App\Helper;

use App\Helper\DateHelper;
use App\DTO\Response\IntegrationInsight\IntegrationInsightTimelinePointDTO;
use App\DTO\Response\IntegrationInsight\IntegrationInsightsViewsTimelinePointDTO;
use App\DTO\Response\PostInsight\PostInsightTimelinePointDTO;

class TimelineGapFillerHelper
{
    /**
     * Fills missing hourly points between existing data points.
     * For each missing hour, copies the value from the previous point.
     *
     * @param PostInsightTimelinePointDTO[] $points - sorted by hoursAfterPublication ASC
     * @return PostInsightTimelinePointDTO[]
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
                $result[] = new PostInsightTimelinePointDTO(
                    hoursAfterPublication: (float) $hour,
                    value: $previousPoint->getValue(),
                    averageValue: $previousPoint->getAverageValue(),
                );
            }
        }

        return $result;
    }

    /**
     * Fills missing daily points between $startDate and $endDate with zero-value points.
     * Unlike fillIntegrationInsightTimelinePointsDailyGaps() (forward-fill), this variant
     * zero-fills gaps because the views timeline represents daily growth, not cumulative state.
     *
     * @param IntegrationInsightsViewsTimelinePointDTO[] $points
     * @return IntegrationInsightsViewsTimelinePointDTO[]
     */
    public static function fillIntegrationInsightsViewsTimelinePointsDailyGaps(
        array $points,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
    ): array {
        $valuesByDate = [];
        foreach ($points as $point) {
            $valuesByDate[$point->getDate()] = $point->getValue();
        }

        $result = [];
        $currentDate = DateHelper::createUtcDateTimeImmutable($startDate->format('Y-m-d'));
        $lastDate = DateHelper::createUtcDateTimeImmutable($endDate->format('Y-m-d'));

        while ($currentDate <= $lastDate) {
            $dateKey = $currentDate->format('Y-m-d');
            $result[] = new IntegrationInsightsViewsTimelinePointDTO(
                date: $dateKey,
                value: $valuesByDate[$dateKey] ?? 0.0,
            );
            $currentDate = $currentDate->modify('+1 day');
        }

        return $result;
    }

    /**
     * Fills missing daily points between existing data points.
     * For each missing day, creates a synthetic point with the previous day's value.
     *
     * @param IntegrationInsightTimelinePointDTO[] $points - sorted by createdAt ASC
     * @return IntegrationInsightTimelinePointDTO[]
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
                $result[] = new IntegrationInsightTimelinePointDTO(
                    createdAt: $currentDate->setTime(0, 0, 0),
                    value: $previousPoint->getValue(),
                );
            }

            $currentDate = $currentDate->modify('+1 day');
        }

        return $result;
    }
}
