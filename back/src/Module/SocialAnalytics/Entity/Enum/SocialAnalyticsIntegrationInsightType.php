<?php

namespace App\Module\SocialAnalytics\Entity\Enum;

enum SocialAnalyticsIntegrationInsightType: string
{
    case Views = 'views';
    case Likes = 'likes';
    case Saves = 'saves';
    case Comments = 'comments';
    case Shares = 'shares';
    case Followers = 'followers';
    case Impressions = 'impressions';
    case Dislikes = 'dislikes';
    case ProfileLinksTaps = 'profile_links_taps';
    case Reach = 'reach';
    case Videos = 'videos';
}
