<?php

namespace App\Controller;

use App\DTO\QueryParam\Project\ListProjectsQueryParamDTO;
use App\DTO\Request\Project\CreateProjectRequestDTO;
use App\DTO\Request\Project\UpdateProjectRequestDTO;
use App\Entity\Project;
use App\Entity\User;
use App\Exception\Project\ProjectAlreadyFinishedException;
use App\Exception\Project\ProjectAlreadyOpenException;
use App\Exception\Project\ProjectLimitReachedException;
use App\Exception\Project\ProjectNameConflictException;
use App\Exception\Project\ProjectNotFoundException;
use App\Helper\DateHelper;
use App\Repository\ProjectRepository;
use App\Repository\SubscriptionRepository;
use App\Service\Stripe\StripePlanService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\DependencyInjection\Security\Factory\StatelessAuthenticatorFactoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/projects', requirements: ['projectUuid' => Requirement::UUID])]
final class ProjectController extends AbstractController
{
    #[Route('', name: 'api_projects_create', methods: ['POST'])]
    public function create(CreateProjectRequestDTO $dto, ProjectRepository $projectRepository, SubscriptionRepository $subscriptionRepository, StripePlanService $stripePlanService): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $plan = $subscriptionRepository->getLatestActiveByUser($user)?->getPlan();
        $maxProjects = $plan !== null ? $stripePlanService->getPlanConfigFromSubscription($plan)?->getMaxProjects() : 1;

        if ($maxProjects !== null && $projectRepository->countByUser($user) >= $maxProjects) {
            throw new ProjectLimitReachedException();
        }

        /** @var Project $project */
        $project = $dto->build();

        $project->setUser($user);

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_create']]);
    }

    #[Route('/{projectUuid}', name: 'api_projects_update', methods: ['PATCH'])]
    public function update(string $projectUuid, UpdateProjectRequestDTO $dto, ProjectRepository $projectRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        if ($dto->getName() !== null && $dto->getName() != $project->getName()) {
            $projectWithSameName = $projectRepository->getByNameAndUser($dto->getName(), $user);
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
    public function show(string $projectUuid, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_get_by_uuid']]);
    }

    #[Route('/{projectUuid}/finish', name: 'api_projects_finish', methods: ['POST'])]
    public function finish(string $projectUuid, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($projectUuid, $user);

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
    public function reopen(string $projectUuid, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($projectUuid, $user);

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
    public function list(ListProjectsQueryParamDTO $queryParamDto, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $projects = $projectRepository->getByUserPaginated($user, $queryParamDto->getPage(), $queryParamDto->getLimit());

        return $this->json(data: $projects, status: Response::HTTP_OK, context: ['groups' => ['api_projects_get_paginated']]);
    }

    #[Route('/{projectUuid}', name: 'api_projects_delete', methods: ['DELETE'])]
    public function delete(
        string $projectUuid,
        ProjectRepository $projectRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($projectUuid, $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $projectRepository->remove($project, true);

        return $this->json(data: ["message" => "Project deleted successfully"], status: Response::HTTP_OK);
    }
}
