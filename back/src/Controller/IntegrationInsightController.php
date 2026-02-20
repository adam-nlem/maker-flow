<?php

namespace App\Controller;

use App\Entity\Enum\IntegrationProvider;
use App\Entity\User;
use App\DTO\QueryParam\IntegrationInsight\ListIntegrationInsightsQueryParamDTO;
use App\DTO\QueryParam\IntegrationInsight\ShowIntegrationDetailQueryParamDTO;
use App\Entity\Enum\TimePeriod;
use App\Repository\IntegrationInsightRepository;
use App\Service\IntegrationInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/integration-insights')]
final class IntegrationInsightController extends AbstractController
{
    #[Route('', name: 'api_integration_insights_list', methods: ['GET'])]
    public function list(
        ListIntegrationInsightsQueryParamDTO $queryParamDto,
        IntegrationRepository $integrationRepository,
        IntegrationInsightRepository $insightRepository,
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
            context: ['groups' => ['api_integration_insights_list']],
        );
    }

    #[Route('/detail', name: 'api_integration_insights_detail', methods: ['GET'])]
    public function detail(
        ShowIntegrationDetailQueryParamDTO $queryParamDto,
        IntegrationRepository $integrationRepository,
        IntegrationInsightService $insightService,
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

        $detail = $insightService->getDetail(
            user: $user,
            integration: $integration,
            timePeriod: TimePeriod::LastYear,
        );

        return $this->json(
            data: $detail->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_integration_insights_detail']],
        );
    }
}
