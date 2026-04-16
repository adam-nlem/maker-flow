<?php

namespace App\Entity\Enum;

enum PostInsightType: string
{
    case Reach = 'reach';
    case TotalInteractions = 'total_interactions';
    case Saves = 'saves';
    case Shares = 'shares';
    case Views = 'views';
    case Likes = 'likes';
    case Dislikes = 'dislikes';
    case Comments = 'comments';
    case AverageWatchTime = 'average_watch_time';
    case TotalWatchTime = 'total_watch_time';
    case ThumbnailImpressions = 'thumbnail_impressions';
    case ThumbnailImpressionsClickRate = 'thumbnail_impressions_click_rate';
    case FollowersGained = 'followers_gained';
    case FollowersLost = 'followers_lost';
    case AudienceWatchRatio = 'audience_watch_ratio';

    public function getValueFormat(): InsightValueFormat
    {
        return match ($this) {
            self::AverageWatchTime, self::TotalWatchTime => InsightValueFormat::Seconds,
            self::ThumbnailImpressionsClickRate, self::AudienceWatchRatio => InsightValueFormat::Percentage,
            default => InsightValueFormat::Integer,
        };
    }

    public function shouldAverage(): bool
    {
        return match ($this) {
            self::AverageWatchTime,
            self::ThumbnailImpressionsClickRate,
            self::AudienceWatchRatio => true,
            default => false,
        };
    }
}
