<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\Service\SocialAnalyticsMetricLogService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/metric-logs')]
class SocialAnalyticsMetricLogController extends AbstractController
{
    public function __construct(private SocialAnalyticsMetricLogService $service)
    {
    }

    #[Route('', name: 'api_modules_social_analytics_metric_logs_list', methods: ['GET'])]
    public function list()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('', name: 'api_modules_social_analytics_metric_logs_create', methods: ['POST'])]
    public function create()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{metricLogUuid}', name: 'api_modules_social_analytics_metric_logs_show', methods: ['GET'])]
    public function show(string $metricLogUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{metricLogUuid}', name: 'api_modules_social_analytics_metric_logs_update', methods: ['PATCH'])]
    public function update(string $metricLogUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{metricLogUuid}', name: 'api_modules_social_analytics_metric_logs_delete', methods: ['DELETE'])]
    public function delete(string $metricLogUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }
}
