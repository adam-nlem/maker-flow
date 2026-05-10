<?php

namespace App\Controller;

use App\DTO\Request\Invitation\CompleteInvitationRequestDTO;
use App\Entity\Token;
use App\Repository\TokenRepository;
use App\Service\Cookie\CookieService;
use App\Service\Invitation\InvitationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/invitations')]
final class InvitationController extends AbstractController
{
    #[Route('/{token}', name: 'api_invitations_show', methods: ['GET'])]
    public function show(string $token, InvitationService $invitationService): JsonResponse
    {
        $invitation = $invitationService->verifyToken($token);

        return $this->json(
            data: $invitation,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_invitation_show']],
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
            context: ['groups' => ['api_user_me']],
        );

        $cookieService->addCookieToHeaders($authToken, $request, $res);

        return $res;
    }
}
