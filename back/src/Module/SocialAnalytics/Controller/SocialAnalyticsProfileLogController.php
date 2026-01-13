<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\Service\SocialAnalyticsProfileLogService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/profile-logs')]
class SocialAnalyticsProfileLogController extends AbstractController
{
    public function __construct(private SocialAnalyticsProfileLogService $service)
    {
    }

    #[Route('', name: 'api_modules_social_analytics_profile_logs_list', methods: ['GET'])]
    public function list()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('', name: 'api_modules_social_analytics_profile_logs_create', methods: ['POST'])]
    public function create()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{profileLogUuid}', name: 'api_modules_social_analytics_profile_logs_show', methods: ['GET'])]
    public function show(string $profileLogUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{profileLogUuid}', name: 'api_modules_social_analytics_profile_logs_update', methods: ['PATCH'])]
    public function update(string $profileLogUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{profileLogUuid}', name: 'api_modules_social_analytics_profile_logs_delete', methods: ['DELETE'])]
    public function delete(string $profileLogUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }
}
