<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\DTO\QueryParam\ListSocialAnalyticsIntegrationInsightQueryParamDTO;
use App\Module\SocialAnalytics\DTO\QueryParam\ShowSocialAnalyticsIntegrationOverviewQueryParamDTO;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsIntegrationInsightRepository;
use App\Module\SocialAnalytics\Service\SocialAnalyticsIntegrationInsightService;
use App\Module\SocialAnalytics\Service\SocialAnalyticsIntegrationOverviewService;
use App\Repository\IntegrationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/integration-insights')]
class SocialAnalyticsIntegrationInsightController extends AbstractController
{
    #[Route('', name: 'api_modules_social_analytics_integration_insights_list', methods: ['GET'])]
    public function list(
        ListSocialAnalyticsIntegrationInsightQueryParamDTO $queryParamDto,
        IntegrationRepository $integrationRepository,
        SocialAnalyticsIntegrationInsightRepository $insightRepository,
        SocialAnalyticsIntegrationInsightService $insightService,
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $integrationRepository->getByUuidAndUser($queryParamDto->getIntegrationUuid(), $user);

        if ($integration === null) {
            return $this->json(
                data: ["message" => "You don't have any integration with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        $insights = $insightRepository->getLatestByUserAndByIntegration($user, $integration);

        return $this->json(
            data: $insights,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_modules_social_analytics_integration_insights_list']],
        );
    }

    #[Route('/overview', name: 'api_modules_social_analytics_integration_insights_overview', methods: ['GET'])]
    public function overview(
        ShowSocialAnalyticsIntegrationOverviewQueryParamDTO $queryParamDto,
        IntegrationRepository $integrationRepository,
        SocialAnalyticsIntegrationOverviewService $overviewService,
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $integrationRepository->getByUuidAndUser($queryParamDto->getIntegrationUuid(), $user);

        if ($integration === null) {
            return $this->json(
                data: ["message" => "You don't have any integration with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        $overview = $overviewService->getOverview(
            user: $user,
            integration: $integration,
            timePeriod: $queryParamDto->getTimePeriod(),
        );

        return $this->json(
            data: $overview->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_modules_social_analytics_integration_insights_overview']],
        );
    }
}
