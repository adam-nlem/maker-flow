<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\Service\SocialAnalyticsPostLogService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/post-logs')]
class SocialAnalyticsPostLogController extends AbstractController
{
    public function __construct(private SocialAnalyticsPostLogService $service)
    {
    }

    #[Route('', name: 'api_modules_social_analytics_post_logs_list', methods: ['GET'])]
    public function list()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('', name: 'api_modules_social_analytics_post_logs_create', methods: ['POST'])]
    public function create()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{postLogUuid}', name: 'api_modules_social_analytics_post_logs_show', methods: ['GET'])]
    public function show(string $postLogUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{postLogUuid}', name: 'api_modules_social_analytics_post_logs_update', methods: ['PATCH'])]
    public function update(string $postLogUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{postLogUuid}', name: 'api_modules_social_analytics_post_logs_delete', methods: ['DELETE'])]
    public function delete(string $postLogUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }
}
