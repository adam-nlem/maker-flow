<?php

namespace App\Controller;

use App\DTO\QueryParam\Project\ListProjectsQueryParamDTO;
use App\DTO\Request\Project\CreateProjectRequestDTO;
use App\DTO\Request\Project\UpdateProjectRequestDTO;
use App\Entity\Enum\UserRole;
use App\Entity\Project;
use App\Entity\User;
use App\Exception\Agency\AgencySubscriptionInactiveException;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\Project\ProjectAlreadyFinishedException;
use App\Exception\Project\ProjectAlreadyOpenException;
use App\Exception\Project\ProjectLimitReachedException;
use App\Exception\Project\ProjectNameConflictException;
use App\Exception\Project\ProjectNotFoundException;
use App\Helper\DateHelper;
use App\Repository\AgencyRepository;
use App\Repository\ProjectRepository;
use App\Repository\SubscriptionRepository;
use App\Service\Stripe\StripePlanService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/projects', requirements: ['projectUuid' => Requirement::UUID])]
final class ProjectController extends AbstractController
{
    #[Route('', name: 'api_projects_create', methods: ['POST'])]
    #[IsGranted(UserRole::Editor->value)]
    public function create(
        CreateProjectRequestDTO $dto,
        AgencyRepository $agencyRepository,
        ProjectRepository $projectRepository,
        SubscriptionRepository $subscriptionRepository,
        StripePlanService $stripePlanService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $plan = $subscriptionRepository->getLatestActiveByAgency($agency)?->getPlan();
        $maxProjects = $plan !== null ? $stripePlanService->getPlanConfigFromSubscription($plan)?->getMaxProjects() : 1;

        if ($maxProjects !== null && $projectRepository->countByAgency($agency) >= $maxProjects) {
            throw new ProjectLimitReachedException();
        }

        /** @var Project $project */
        $project = $dto->build();

        $project->setAgency($agency);

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_create']]);
    }

    #[Route('/{projectUuid}', name: 'api_projects_update', methods: ['PATCH'])]
    #[IsGranted(UserRole::Editor->value)]
    public function update(string $projectUuid, UpdateProjectRequestDTO $dto, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        if ($dto->getName() !== null && $dto->getName() != $project->getName()) {
            $projectWithSameName = $projectRepository->getByNameAndAgency($dto->getName(), $project->getAgency());
            if ($projectWithSameName !== null) {
                throw new ProjectNameConflictException();
            }
            $project->setName($dto->getName());
        }

        if ($dto->getDescription() !== null && $dto->getDescription() != $project->getDescription()) {
            $project->setDescription($dto->getDescription());
        }

        if ($dto->getTypes() !== null && $dto->getTypes() !== []) {
            $project->setTypes($dto->getTypes());
        }

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_update']]);
    }

    #[Route('/{projectUuid}', name: 'api_projects_show', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function show(
        string $projectUuid,
        ProjectRepository $projectRepository,
        SubscriptionRepository $subscriptionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        if (
            $user->hasRole(UserRole::Client)
            && $subscriptionRepository->getLatestActiveByAgency($project->getAgency()) === null
        ) {
            throw new AgencySubscriptionInactiveException();
        }

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_get_by_uuid']]);
    }

    #[Route('/{projectUuid}/finish', name: 'api_projects_finish', methods: ['POST'])]
    #[IsGranted(UserRole::Editor->value)]
    public function finish(string $projectUuid, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        if ($project->getFinishedAt() !== null) {
            throw new ProjectAlreadyFinishedException();
        }

        $project->setFinishedAt(DateHelper::createUtcDateTimeImmutable());

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_finish']]);
    }

    #[Route('/{projectUuid}/reopen', name: 'api_projects_reopen', methods: ['POST'])]
    #[IsGranted(UserRole::Editor->value)]
    public function reopen(string $projectUuid, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        if ($project->getFinishedAt() === null) {
            throw new ProjectAlreadyOpenException();
        }

        $project->setFinishedAt(null);

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_reopen']]);
    }

    #[Route('', name: 'api_projects_list', methods: ['GET'])]
    #[IsGranted(UserRole::Viewer->value)]
    public function list(
        ListProjectsQueryParamDTO $queryParamDto,
        AgencyRepository $agencyRepository,
        ProjectRepository $projectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            return $this->json(data: [], status: Response::HTTP_OK);
        }

        $projects = $projectRepository->getByAgencyPaginated($agency, $queryParamDto->getPage(), $queryParamDto->getLimit());

        return $this->json(data: $projects, status: Response::HTTP_OK, context: ['groups' => ['api_projects_get_paginated']]);
    }

    #[Route('/{projectUuid}', name: 'api_projects_delete', methods: ['DELETE'])]
    #[IsGranted(UserRole::Editor->value)]
    public function delete(
        string $projectUuid,
        ProjectRepository $projectRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $projectRepository->remove($project, true);

        return $this->json(data: ["message" => "Project deleted successfully"], status: Response::HTTP_OK);
    }

}
