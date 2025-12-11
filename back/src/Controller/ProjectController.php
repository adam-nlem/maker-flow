<?php

namespace App\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\Project\CreateProjectRequestDTO;
use App\DTO\Request\Project\UpdateProjectRequestDTO;
use App\Entity\Project;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Repository\ProjectRepository;
use App\Repository\UserModuleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\DependencyInjection\Security\Factory\StatelessAuthenticatorFactoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/projects')]
final class ProjectController extends AbstractController
{
    #[Route('', name: 'api_project_create', methods: ['POST'])]
    public function create(CreateProjectRequestDTO $dto, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        try {
            /** @var Project $project */
            $project = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $project->setUser($user);

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_create']]);
    }

    #[Route('/{projectUuid}', name: 'api_project_update', methods: ['PATCH'])]
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

        if ($dto->getType() !== null) {
            $project->setType($dto->getType());
        }

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_update']]);
    }

    #[Route('/{projectUuid}', name: 'api_project_get_by_uuid', methods: ['GET'])]
    public function getByUuid(string $projectUuid, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($projectUuid, $user);

        if ($project === null) {
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_get_by_uuid']]);
    }

    #[Route('/{projectUuid}/finish', name: 'api_project_finish', methods: ['POST'])]
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

    #[Route('/{projectUuid}/reopen', name: 'api_project_reopen', methods: ['POST'])]
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

    #[Route('/{projectUuid}/user-modules', name: 'api_project_get_user_modules', methods: ['GET'])]
    public function getUserModules(
        string $projectUuid,
        ProjectRepository $projectRepository,
        UserModuleRepository $userModuleRepository
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($projectUuid, $user);

        if ($project === null) {
            return $this->json(
                data: ["message" => "You don't have any project with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        $userModules = $userModuleRepository->getByUserAndProject($user, $project);

        return $this->json(
            data: $userModules,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_project_get_user_modules']]
        );
    }

    #[Route('/{page}/{limit}', name: 'api_projects_get_paginated', methods: ['GET'])]
    public function getPaginated(int $page, int $limit, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $projects = $projectRepository->getByUserPaginated($user, $page, $limit);

        return $this->json(data: $projects, status: Response::HTTP_OK, context: ['groups' => ['api_projects_get_paginated']]);
    }

    //TODO: Maybe do a delete route here ? 
}
