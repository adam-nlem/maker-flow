<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\Service\SocialAnalyticsPostGroupService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/post-groups')]
class SocialAnalyticsPostGroupController extends AbstractController
{
    public function __construct(private SocialAnalyticsPostGroupService $service)
    {
    }

    #[Route('', name: 'api_modules_social_analytics_post_groups_list', methods: ['GET'])]
    public function list()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('', name: 'api_modules_social_analytics_post_groups_create', methods: ['POST'])]
    public function create()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{postGroupUuid}', name: 'api_modules_social_analytics_post_groups_show', methods: ['GET'])]
    public function show(string $postGroupUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{postGroupUuid}', name: 'api_modules_social_analytics_post_groups_update', methods: ['PATCH'])]
    public function update(string $postGroupUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{postGroupUuid}', name: 'api_modules_social_analytics_post_groups_delete', methods: ['DELETE'])]
    public function delete(string $postGroupUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }
}
