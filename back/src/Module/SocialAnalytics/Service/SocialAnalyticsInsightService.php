<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Integration;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsInsightRepository;

class SocialAnalyticsInsightService
{
    public function __construct(
        private SocialAnalyticsInsightRepository $repository
    ) {
    }

}
