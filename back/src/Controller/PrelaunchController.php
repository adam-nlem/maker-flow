<?php

namespace App\Controller;

use App\DTO\Request\Prelaunch\AuthenticatePrelaunchRequestDTO;
use App\DTO\Response\Prelaunch\AuthenticatePrelaunchResponseDTO;
use App\Entity\User;
use App\Exception\Prelaunch\PrelaunchNotEnabledException;
use App\Service\Prelaunch\PrelaunchService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/prelaunch')]
final class PrelaunchController extends AbstractController
{
    public function __construct(
        private readonly bool $prelaunchEnabled,
    ) {}

    #[Route('/authenticate', name: 'api_prelaunch_authenticate', methods: ['POST'])]
    public function authenticate(
        AuthenticatePrelaunchRequestDTO $dto,
        PrelaunchService $prelaunchService,
        Request $request,
    ): JsonResponse {
        if (!$this->prelaunchEnabled) {
            throw new PrelaunchNotEnabledException();
        }

        $otp = $prelaunchService->authenticate(
            $dto->getEmail(),
            $request->getClientIp(),
            $dto->getReferralCode(),
        );

        $responseDto = new AuthenticatePrelaunchResponseDTO(
            $otp->getPendingOtpToken(),
            $dto->getEmail(),
        );

        return $this->json(
            data: $responseDto->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_prelaunch_authenticate']],
        );
    }

    #[Route('/status', name: 'api_prelaunch_status', methods: ['GET'])]
    public function status(
        PrelaunchService $prelaunchService,
    ): JsonResponse {
        if (!$this->prelaunchEnabled) {
            throw new PrelaunchNotEnabledException();
        }

        /** @var User $user */
        $user = $this->getUser();

        $responseDto = $prelaunchService->getStatus($user);

        return $this->json(
            data: $responseDto->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_prelaunch_status']],
        );
    }
}
