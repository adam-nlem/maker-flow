<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\DTO\QueryParam\PostInsight\ListSocialAnalyticsPostInsightQueryParamDTO;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightRepository;
use App\Module\SocialAnalytics\Service\SocialAnalyticsPostInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/post-insights')]
class SocialAnalyticsPostInsightController extends AbstractController
{
    public function __construct(private SocialAnalyticsPostInsightService $service) {}

    #[Route('', name: 'api_modules_social_analytics_post_insights_list', methods: ['GET'])]
    public function list(
        ListSocialAnalyticsPostInsightQueryParamDTO $queryParamDto,
        IntegrationRepository $integrationRepository,
        SocialAnalyticsPostInsightRepository $insightRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $integrationRepository->getByUuidAndUser($queryParamDto->getIntegrationUuid(), $user);

        if ($integration === null) {
            return $this->json(
                data: ["message" => "You don't have any integration with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        // TODO: Implement list logic
    }

    #[Route('', name: 'api_modules_social_analytics_post_insights_create', methods: ['POST'])]
    public function create()
    {
        /** @var User $user */
        $user = $this->getUser();

        // TODO: Implement create logic
    }

    #[Route('/{postInsightUuid}', name: 'api_modules_social_analytics_post_insights_show', methods: ['GET'])]
    public function show(string $postInsightUuid)
    {
        /** @var User $user */
        $user = $this->getUser();

        // TODO: Implement show logic
    }

    #[Route('/{postInsightUuid}', name: 'api_modules_social_analytics_post_insights_update', methods: ['PATCH'])]
    public function update(string $postInsightUuid)
    {
        /** @var User $user */
        $user = $this->getUser();

        // TODO: Implement update logic
    }

    #[Route('/{postInsightUuid}', name: 'api_modules_social_analytics_post_insights_delete', methods: ['DELETE'])]
    public function delete(string $postInsightUuid)
    {
        /** @var User $user */
        $user = $this->getUser();

        // TODO: Implement delete logic
    }
}
