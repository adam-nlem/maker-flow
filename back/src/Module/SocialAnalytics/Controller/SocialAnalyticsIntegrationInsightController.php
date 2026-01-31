<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\DTO\QueryParam\IntegrationInsight\ListSocialAnalyticsIntegrationInsightsQueryParamDTO;
use App\Module\SocialAnalytics\DTO\QueryParam\IntegrationInsight\ShowSocialAnalyticsIntegrationDetailQueryParamDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsTimePeriod;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsIntegrationInsightRepository;
use App\Module\SocialAnalytics\Service\SocialAnalyticsIntegrationDetailService;
use App\Module\SocialAnalytics\Service\SocialAnalyticsIntegrationInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/integration-insights')]
class SocialAnalyticsIntegrationInsightController extends AbstractController
{
    #[Route('', name: 'api_modules_social_analytics_integration_insights_list', methods: ['GET'])]
    public function list(
        ListSocialAnalyticsIntegrationInsightsQueryParamDTO $queryParamDto,
        IntegrationRepository $integrationRepository,
        SocialAnalyticsIntegrationInsightRepository $insightRepository,
        SocialAnalyticsIntegrationInsightService $s,
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

    #[Route('/detail', name: 'api_modules_social_analytics_integration_insights_detail', methods: ['GET'])]
    public function detail(
        ShowSocialAnalyticsIntegrationDetailQueryParamDTO $queryParamDto,
        IntegrationRepository $integrationRepository,
        SocialAnalyticsIntegrationDetailService $detailService,
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

        $detail = $detailService->getDetail(
            user: $user,
            integration: $integration,
            timePeriod: SocialAnalyticsTimePeriod::LastYear,
        );

        return $this->json(
            data: $detail->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_modules_social_analytics_integration_insights_detail']],
        );
    }
}
