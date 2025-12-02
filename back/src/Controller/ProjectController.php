<?php

namespace App\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\Project\CreateProjectRequestDTO;
use App\Entity\Project;
use App\Entity\User;
use App\Repository\ProjectRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/projects')]
final class ProjectController extends AbstractController
{
    #[Route('/', name: 'api_projects_create', methods: ['POST'])]
    public function create(CreateProjectRequestDTO $dto, ProjectRepository $projectRepository): Response
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



    #TODO: Create
    # Update
    # Get Single
    # Get All Paginated
    # Finish
    # Delete
}
