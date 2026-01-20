<?php

namespace App\Module\SocialAnalytics\Service;

use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightRepository;

class SocialAnalyticsPostInsightService
{
    public function __construct(
        private readonly SocialAnalyticsPostInsightRepository $repository,
    ) {}

    // TODO: Implement service logic
}
