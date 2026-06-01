<?php

namespace App\Controller;

use App\DTO\QueryParam\ProjectClient\ListProjectClientsQueryParamDTO;
use App\DTO\Response\ProjectClient\ListProjectClientsResponseDTO;
use App\Entity\Enum\UserRole;
use App\Entity\User;
use App\Exception\Project\ProjectNotFoundException;
use App\Exception\ProjectClient\ProjectClientNotFoundException;
use App\Repository\InvitationRepository;
use App\Repository\ProjectRepository;
use App\Repository\TokenRepository;
use App\Repository\UserRepository;
use App\Security\Voter\ProjectVoter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/projects/clients', requirements: ['clientUserUuid' => Requirement::UUID])]
final class ProjectClientController extends AbstractController
{
    #[Route('', name: 'api_projects_clients_list', methods: ['GET'])]
    #[IsGranted(UserRole::Viewer->value)]
    public function list(
        ListProjectClientsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
        InvitationRepository $invitationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $this->denyAccessUnlessGranted(ProjectVoter::VIEW, $project);

        $responseDto = new ListProjectClientsResponseDTO(
            $project->getClientUsers(),
            $invitationRepository->findPendingForProject($project),
        );

        return $this->json(
            data: $responseDto->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_clients_list', 'api_invitations_list']],
        );
    }

    #[Route('/{clientUserUuid}', name: 'api_projects_clients_remove', methods: ['DELETE'])]
    #[IsGranted(UserRole::Editor->value)]
    public function remove(
        string $clientUserUuid,
        UserRepository $userRepository,
        TokenRepository $tokenRepository,
        EntityManagerInterface $em,
    ): JsonResponse {
        $target = $userRepository->getByUuid($clientUserUuid);

        if ($target === null || $target->getProject() === null) {
            throw new ProjectClientNotFoundException();
        }

        $project = $target->getProject();

        $this->denyAccessUnlessGranted(ProjectVoter::MANAGE_CLIENT, $project);

        $target->setProject(null);

        foreach ($target->getTokens() as $token) {
            $tokenRepository->remove($token, false);
        }

        $em->flush();

        return $this->json(data: null, status: Response::HTTP_NO_CONTENT);
    }
}
