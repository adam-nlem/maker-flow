<?php

namespace App\Module\SocialAnalytics\Entity\Enum;

enum SocialAnalyticsPostInsightType: string
{
    case Reach = 'reach';
    case TotalInteractions = 'total_interactions';
    case Saved = 'saved';
    case Shares = 'shares';
    case Views = 'views';
    case Likes = 'likes';
    case Comments = 'comments';
    case AverageWatchTime = 'average_watch_time';
    case TotalWatchTime = 'total_watch_time';
}
