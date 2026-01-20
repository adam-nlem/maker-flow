<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\DTO\QueryParam\ListSocialAnalyticsInsightQueryParamDTO;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsInsightRepository;
use App\Module\SocialAnalytics\Service\SocialAnalyticsInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/insights')]
class SocialAnalyticsInsightController extends AbstractController
{
    #[Route('', name: 'api_modules_social_analytics_insights_list', methods: ['GET'])]
    public function list(
        ListSocialAnalyticsInsightQueryParamDTO $queryParamDto,
        IntegrationRepository $integrationRepository,
        SocialAnalyticsInsightRepository $insightRepository,
        SocialAnalyticsInsightService $insightService,
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

        $insightService->fetchInstagramProfileInsights($integration);

        $insights = $insightRepository->getLatestByUserAndByIntegration($user, $integration);

        return $this->json(
            data: $insights,
            status: Response::HTTP_OK
        );
    }
}
