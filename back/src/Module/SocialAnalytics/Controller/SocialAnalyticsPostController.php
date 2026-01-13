<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\Service\SocialAnalyticsPostService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/posts')]
class SocialAnalyticsPostController extends AbstractController
{
    public function __construct(private SocialAnalyticsPostService $service)
    {
    }

    #[Route('', name: 'api_modules_social_analytics_posts_list', methods: ['GET'])]
    public function list()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('', name: 'api_modules_social_analytics_posts_create', methods: ['POST'])]
    public function create()
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{postUuid}', name: 'api_modules_social_analytics_posts_show', methods: ['GET'])]
    public function show(string $postUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{postUuid}', name: 'api_modules_social_analytics_posts_update', methods: ['PATCH'])]
    public function update(string $postUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('/{postUuid}', name: 'api_modules_social_analytics_posts_delete', methods: ['DELETE'])]
    public function delete(string $postUuid)
    {
        /** @var User $user */
        $user = $this->getUser();
    }
}
