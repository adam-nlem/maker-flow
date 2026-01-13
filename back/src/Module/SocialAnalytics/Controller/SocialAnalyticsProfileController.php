<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\Service\SocialAnalyticsProfileService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/profiles')]
class SocialAnalyticsProfileController extends AbstractController
{
    public function __construct(private SocialAnalyticsProfileService $service)
    {
    }

    #[Route('', name: 'api_modules_social_analytics_profiles_list', methods: ['GET'])]
    public function list()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('', name: 'api_modules_social_analytics_profiles_create', methods: ['POST'])]
    public function create()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{profileUuid}', name: 'api_modules_social_analytics_profiles_show', methods: ['GET'])]
    public function show(string $profileUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{profileUuid}', name: 'api_modules_social_analytics_profiles_update', methods: ['PATCH'])]
    public function update(string $profileUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{profileUuid}', name: 'api_modules_social_analytics_profiles_delete', methods: ['DELETE'])]
    public function delete(string $profileUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }
}
