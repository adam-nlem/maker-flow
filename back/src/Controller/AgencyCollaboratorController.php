<?php

namespace App\Controller;

use App\DTO\Response\AgencyCollaborator\ListAgencyCollaboratorsResponseDTO;
use App\Entity\Enum\UserRole;
use App\Entity\User;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\AgencyCollaborator\AgencyCollaboratorNotFoundException;
use App\Repository\AgencyRepository;
use App\Repository\InvitationRepository;
use App\Repository\TokenRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/agencies/collaborators', requirements: ['userUuid' => Requirement::UUID])]
final class AgencyCollaboratorController extends AbstractController
{
    #[Route('', name: 'api_agencies_collaborators_list', methods: ['GET'])]
    #[IsGranted(UserRole::Viewer->value)]
    public function list(
        AgencyRepository $agencyRepository,
        InvitationRepository $invitationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $responseDto = new ListAgencyCollaboratorsResponseDTO(
            $agency->getCollaborators(),
            $invitationRepository->findPendingForAgency($agency),
        );

        return $this->json(
            data: $responseDto->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_collaborators_list', 'api_invitations_list']],
        );
    }

    #[Route('/{userUuid}', name: 'api_agencies_collaborators_remove', methods: ['DELETE'])]
    #[IsGranted(UserRole::Admin->value)]
    public function remove(
        string $userUuid,
        AgencyRepository $agencyRepository,
        UserRepository $userRepository,
        TokenRepository $tokenRepository,
        EntityManagerInterface $em,
    ): JsonResponse {
        /** @var User $currentUser */
        $currentUser = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($currentUser);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $target = $userRepository->getByUuid($userUuid);

        if ($target === null || $target->getAgency()?->getId() !== $agency->getId()) {
            throw new AgencyCollaboratorNotFoundException();
        }

        $target->setAgency(null);

        foreach ($target->getTokens() as $token) {
            $tokenRepository->remove($token, false);
        }

        $em->flush();

        return $this->json(data: null, status: Response::HTTP_NO_CONTENT);
    }
}
