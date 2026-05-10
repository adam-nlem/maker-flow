<?php

namespace App\Controller;

use App\DTO\Request\Agency\CreateAgencyRequestDTO;
use App\DTO\Request\Invitation\CreateCollaboratorInvitationRequestDTO;
use App\DTO\Response\Agency\ListCollaboratorsResponseDTO;
use App\Entity\Agency;
use App\Entity\User;
use App\Exception\Agency\CollaboratorNotFoundException;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\Agency\UserAlreadyHasAgencyException;
use App\Exception\Invitation\InvalidInvitationRoleException;
use App\Repository\AgencyRepository;
use App\Repository\InvitationRepository;
use App\Repository\TokenRepository;
use App\Repository\UserRepository;
use App\Service\Credit\CreditService;
use App\Service\Invitation\InvitationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/agencies')]
final class AgencyController extends AbstractController
{
    private const WELCOME_CREDITS = 3;

    #[Route('', name: 'api_agencies_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(
        CreateAgencyRequestDTO $dto,
        AgencyRepository $agencyRepository,
        UserRepository $userRepository,
        CreditService $creditService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if ($user->getAgency() !== null) {
            throw new UserAlreadyHasAgencyException();
        }

        /** @var Agency $agency */
        $agency = $dto->build();

        $agencyRepository->save($agency, true);

        $user->setAgency($agency);
        $userRepository->save($user, true);

        $creditService->addWelcomeCredits($agency, self::WELCOME_CREDITS, $user);

        return $this->json(
            data: $agency,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_agency_create']],
        );
    }

    #[Route('/collaborators', name: 'api_agencies_collaborators_list', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function listCollaborators(
        AgencyRepository $agencyRepository,
        InvitationRepository $invitationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $responseDto = new ListCollaboratorsResponseDTO(
            $agency->getCollaborators(),
            $invitationRepository->findPendingForAgency($agency),
        );

        return $this->json(
            data: $responseDto->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_collaborators_list', 'api_invitations_list']],
        );
    }

    #[Route('/collaborators', name: 'api_agencies_collaborators_invite', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function inviteCollaborator(
        CreateCollaboratorInvitationRequestDTO $dto,
        AgencyRepository $agencyRepository,
        InvitationService $invitationService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        if ($dto->getRole() === null) {
            throw new InvalidInvitationRoleException();
        }

        $invitation = $invitationService->createForCollaborator(
            $agency,
            $user,
            $dto->getEmail(),
            $dto->getFirstName(),
            $dto->getLastName(),
            $dto->getRole(),
        );

        return $this->json(
            data: $invitation,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_invitation_create']],
        );
    }

    #[Route('/collaborators/{userUuid}', name: 'api_agencies_collaborators_remove', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function removeCollaborator(
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
            throw new CollaboratorNotFoundException();
        }

        $target->setAgency(null);

        foreach ($target->getTokens() as $token) {
            $tokenRepository->remove($token, false);
        }

        $em->flush();

        return $this->json(data: null, status: Response::HTTP_NO_CONTENT);
    }
}
