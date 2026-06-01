<?php

namespace App\Controller;

use App\DTO\Request\Invitation\CompleteInvitationRequestDTO;
use App\DTO\Request\Invitation\CreateInvitationRequestDTO;
use App\Entity\Enum\InvitationType;
use App\Entity\Enum\UserRole;
use App\Entity\Token;
use App\Entity\User;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\Invitation\InvalidInvitationProjectException;
use App\Exception\Invitation\InvalidInvitationTypeException;
use App\Exception\Invitation\InvitationAlreadyUsedException;
use App\Exception\Invitation\InvitationNotFoundException;
use App\Exception\Project\ProjectNotFoundException;
use App\Repository\AgencyRepository;
use App\Repository\InvitationRepository;
use App\Repository\ProjectRepository;
use App\Repository\TokenRepository;
use App\Security\Voter\ProjectVoter;
use App\Service\Cookie\CookieService;
use App\Service\Invitation\InvitationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/invitations')]
final class InvitationController extends AbstractController
{
    #[Route('', name: 'api_invitations_create', methods: ['POST'])]
    #[IsGranted(UserRole::Editor->value)]
    public function create(
        CreateInvitationRequestDTO $dto,
        ProjectRepository $projectRepository,
        InvitationService $invitationService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $type = $dto->getType() ?? throw new InvalidInvitationTypeException();

        if ($type === InvitationType::Collaborator) {
            $this->denyAccessUnlessGranted(UserRole::Admin->value);
        } else {
            if ($dto->getProjectUuid() === null) {
                throw new InvalidInvitationProjectException();
            }

            $project = $projectRepository->getAccessibleByUuidForUser($dto->getProjectUuid(), $user);

            if ($project === null) {
                throw new ProjectNotFoundException();
            }

            $this->denyAccessUnlessGranted(ProjectVoter::MANAGE_CLIENT, $project);
        }

        $invitation = $invitationService->createInvitation($user, $dto);

        return $this->json(
            data: $invitation,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_invitations_create']],
        );
    }

    #[Route('/{invitationUuid}', name: 'api_invitations_delete', methods: ['DELETE'], requirements: ['invitationUuid' => Requirement::UUID])]
    #[IsGranted(UserRole::Editor->value)]
    public function delete(
        string $invitationUuid,
        InvitationRepository $invitationRepository,
        AgencyRepository $agencyRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $invitation = $invitationRepository->getByUuid($invitationUuid);

        if ($invitation === null) {
            throw new InvitationNotFoundException();
        }

        if ($invitation->isUsed()) {
            throw new InvitationAlreadyUsedException();
        }

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        if ($invitation->getAgency()?->getId() !== $agency->getId()) {
            throw new InvitationNotFoundException();
        }

        if ($invitation->getType() === InvitationType::Collaborator) {
            $this->denyAccessUnlessGranted(UserRole::Admin->value);
        } else {
            $project = $invitation->getProject();

            if ($project === null) {
                throw new InvitationNotFoundException();
            }

            $this->denyAccessUnlessGranted(ProjectVoter::MANAGE_CLIENT, $project);
        }

        $invitationRepository->remove($invitation, true);

        return $this->json(data: null, status: Response::HTTP_NO_CONTENT);
    }

    #[Route('/{token}', name: 'api_invitations_show', methods: ['GET'])]
    public function show(string $token, InvitationService $invitationService): JsonResponse
    {
        $invitation = $invitationService->verifyToken($token);

        return $this->json(
            data: $invitation,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_invitations_show']],
        );
    }

    #[Route('/{token}/complete', name: 'api_invitations_complete', methods: ['POST'])]
    public function complete(
        string $token,
        CompleteInvitationRequestDTO $dto,
        InvitationService $invitationService,
        TokenRepository $tokenRepository,
        CookieService $cookieService,
        Request $request,
    ): JsonResponse {
        $invitation = $invitationService->verifyToken($token);

        $user = $invitationService->completeSetup($invitation, $dto->getPassword());

        $authToken = new Token();
        $user->addToken($authToken);
        $tokenRepository->save($authToken, true);

        $res = $this->json(
            data: $user,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_users_me']],
        );

        $cookieService->addCookieToHeaders($authToken, $request, $res);

        return $res;
    }
}
