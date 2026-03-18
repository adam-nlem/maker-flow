<?php

namespace App\Controller;

use App\DTO\Request\Prelaunch\AuthenticatePrelaunchRequestDTO;
use App\DTO\Response\Prelaunch\AuthenticatePrelaunchResponseDTO;
use App\Entity\User;
use App\Service\Prelaunch\Exception\RateLimitExceededException;
use App\Service\Prelaunch\Exception\SubscriberNotFoundException;
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
            return $this->json(data: ['message' => 'Prelaunch is not enabled.'], status: Response::HTTP_NOT_FOUND);
        }

        try {
            $otp = $prelaunchService->authenticate(
                $dto->getEmail(),
                $request->getClientIp(),
                $dto->getReferralCode(),
            );
        } catch (RateLimitExceededException $e) {
            return $this->json(
                data: ['message' => $e->getMessage()],
                status: Response::HTTP_TOO_MANY_REQUESTS,
            );
        }

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
            return $this->json(data: ['message' => 'Prelaunch is not enabled.'], status: Response::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();

        try {
            $responseDto = $prelaunchService->getStatus($user);
        } catch (SubscriberNotFoundException $e) {
            return $this->json(
                data: ['message' => $e->getMessage()],
                status: Response::HTTP_NOT_FOUND,
            );
        }

        return $this->json(
            data: $responseDto->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_prelaunch_status']],
        );
    }
}
