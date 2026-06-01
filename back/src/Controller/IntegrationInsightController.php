<?php

namespace App\Controller;

use App\Entity\Enum\UserRole;
use App\Entity\User;
use App\DTO\QueryParam\IntegrationInsight\ListIntegrationInsightsQueryParamDTO;
use App\DTO\QueryParam\IntegrationInsight\ShowIntegrationDetailQueryParamDTO;
use App\Entity\Enum\TimePeriod;
use App\Exception\Integration\IntegrationNotFoundException;
use App\Exception\Project\ProjectNotFoundException;
use App\Repository\ProjectRepository;
use App\Service\IntegrationInsight\IntegrationInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/integration-insights')]
final class IntegrationInsightController extends AbstractController
{
    #[Route('', name: 'api_integration_insights_list', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function list(
        ListIntegrationInsightsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
        IntegrationInsightService $insightService,
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $result = $insightService->list(
            project: $project,
            timePeriod: $queryParamDto->getTimePeriod(),
        );

        return $this->json(
            data: $result->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_integration_insights_list']],
        );
    }
}
