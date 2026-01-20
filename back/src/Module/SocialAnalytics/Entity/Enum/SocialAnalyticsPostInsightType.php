<?php

namespace App\Module\SocialAnalytics\Entity\Enum;

enum SocialAnalyticsPostInsightType: string
{
    case Reach = 'reach';
    case TotalInteractions = 'total_interactions';
    case Saved = 'saved';
    case Views = 'views';
    case Likes = 'likes';
    case Comments = 'comments';
}
