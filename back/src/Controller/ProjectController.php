<?php

namespace App\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\Project\CreateProjectRequestDTO;
use App\DTO\Request\Project\UpdateProjectRequestDTO;
use App\Entity\Project;
use App\Entity\User;
use App\Repository\ProjectRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\DependencyInjection\Security\Factory\StatelessAuthenticatorFactoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/projects')]
final class ProjectController extends AbstractController
{
    #[Route('/', name: 'api_project_create', methods: ['POST'])]
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
    public function update(string $projectUuid, UpdateProjectRequestDTO $dto, ProjectRepository $projectRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($projectUuid, $user);

        if ($project === null) {
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }



        if ($dto->getName() !== null) {

            $projectWithSameName = $projectRepository->getByNameAndUser($dto->getName(), $user);

            if ($projectWithSameName !== null) {
                return $this->json(data: ["Message" => "You already use this name for another project"], status: Response::HTTP_CONFLICT);
            }

            $project->setName($dto->getName());
        }

        if ($dto->getDescription() !== null) {
            $project->setDescription($dto->getDescription());
        }

        if ($dto->getType() !== null) {
            $project->setType($dto->getType());
        }

        $projectRepository->save($project, true);

        return $this->json(data: $project, status: Response::HTTP_OK, context: ['groups' => ['api_project_update']]);
    }

    #TODO: Create
    # Update
    # Get Single
    # Get All Paginated
    # Finish
    # Delete
}
