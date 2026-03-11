<?php

namespace App\Controller;

use App\DTO\QueryParam\Project\ListProjectsQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\Project\CreateProjectRequestDTO;
use App\DTO\Request\Project\UpdateProjectRequestDTO;
use App\Entity\Enum\OnboardingStep;
use App\Entity\Project;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Repository\ProjectRepository;
use App\Repository\SubscriptionRepository;
use App\Service\OnboardingService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\DependencyInjection\Security\Factory\StatelessAuthenticatorFactoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

use function Sentry\captureException;

#[Route('/api/projects', requirements: ['projectUuid' => Requirement::UUID])]
final class ProjectController extends AbstractController
{
    #[Route('', name: 'api_projects_create', methods: ['POST'])]
    public function create(CreateProjectRequestDTO $dto, ProjectRepository $projectRepository, SubscriptionRepository $subscriptionRepository, OnboardingService $onboardingService): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $plan = $subscriptionRepository->getActiveByUser($user)?->getPlan();
        $maxProjects = $plan?->getMaxProjects() ?? 1;

        if ($maxProjects !== null && $projectRepository->countByUser($user) >= $maxProjects) {
            return $this->json(
                data: ["message" => "You have reached the project limit for your plan."],
                status: Response::HTTP_PAYMENT_REQUIRED
            );
        }

        try {
            /** @var Project $project */
            $project = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $project->setUser($user);

        $projectRepository->save($project, true);

        try {
            $onboarding = $onboardingService->getOrCreateOnboarding($user);
            $onboardingService->completeStep($onboarding, OnboardingStep::CreateFirstProject);
        } catch (\Exception $e) {
            captureException($e);
        }

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_create']]);
    }

    #[Route('/{projectUuid}', name: 'api_projects_update', methods: ['PATCH'])]
    public function update(string $projectUuid, UpdateProjectRequestDTO $dto, ProjectRepository $projectRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($projectUuid, $user);

        if ($project === null) {
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getName() !== null && $dto->getName() != $project->getName()) {
            $projectWithSameName = $projectRepository->getByNameAndUser($dto->getName(), $user);
            if ($projectWithSameName !== null) {
                return $this->json(data: ["Message" => "You already use this name for another project"], status: Response::HTTP_CONFLICT);
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
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
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
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($project->getFinishedAt() !== null) {
            return $this->json(data: ["message" => "This project has already been finished"], status: Response::HTTP_NOT_MODIFIED);
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
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($project->getFinishedAt() === null) {
            return $this->json(data: ["message" => "This project is already open"], status: Response::HTTP_NOT_MODIFIED);
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
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $projectRepository->remove($project, true);

        return $this->json(data: ["message" => "Project deleted successfully"], status: Response::HTTP_OK);
    }
}
