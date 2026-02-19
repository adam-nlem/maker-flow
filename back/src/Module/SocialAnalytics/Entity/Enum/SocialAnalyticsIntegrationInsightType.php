<?php

namespace App\Module\SocialAnalytics\Entity\Enum;

// All these insights are day to day insights except TotalFollowers
enum SocialAnalyticsIntegrationInsightType: string
{
    case Views = 'views';
    case Likes = 'likes';
    case Saves = 'saves';
    case Comments = 'comments';
    case Shares = 'shares';
    case GainedFollowers = 'gained_followers';
    case TotalFollowers = 'total_followers';
    case Impressions = 'impressions';
    case Dislikes = 'dislikes';
    case ProfileLinksTaps = 'profile_links_taps';
    case Reach = 'reach';
    case Videos = 'videos';

    // Followers Demographics
    case FollowersAge = 'followers_age';
    case FollowersCity = 'followers_city';
    case FollowersCountry = 'followers_country';
    case FollowersGender = ' followers_gender';

    // Engaged Audience Demograhpics
    case EngagedAudienceAge = 'engaged_audience_age';
    case EngagedAudienceCity = 'engaged_audience_city';
    case EngagedAudienceCountry = 'engaged_audience_country';
    case EngagedAudienceGender = 'engaged_audience_gender';

    public function getValueFormat(): InsightValueFormat
    {
        return match ($this) {
            default => InsightValueFormat::Integer,
        };
    }
}
