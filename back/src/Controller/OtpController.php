<?php

namespace App\Controller;

use App\DTO\Request\Otp\ResendOtpRequestDTO;
use App\DTO\Request\Otp\VerifyOtpRequestDTO;
use App\DTO\Response\Otp\ResendOtpResponseDTO;
use App\Entity\Token;
use App\Helper\DateHelper;
use App\Repository\OtpRepository;
use App\Repository\TokenRepository;
use App\Service\Cookie\CookieService;
use App\Service\Otp\Exception\ExpiredOtpException;
use App\Service\Otp\Exception\InvalidOtpException;
use App\Service\Otp\Exception\InvalidPendingTokenException;
use App\Service\Otp\Exception\MaxAttemptsOtpException;
use App\Service\Otp\OtpService;
use App\Service\Prelaunch\PrelaunchService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/otp')]
final class OtpController extends AbstractController
{
    #[Route('/verify-login', name: 'api_otp_verify_login', methods: ['POST'])]
    public function verifyLogin(
        VerifyOtpRequestDTO $dto,
        OtpService $otpService,
        TokenRepository $tokenRepository,
        EntityManagerInterface $em,
        CookieService $cookieService,
        Request $request,
    ): JsonResponse {
        try {
            $otp = $otpService->verify($dto->getPendingOtpToken(), $dto->getCode());
        } catch (InvalidOtpException $e) {
            return $this->json(
                data: ['message' => 'Code incorrect.', 'remainingAttempts' => $e->getRemainingAttempts()],
                status: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        } catch (ExpiredOtpException) {
            return $this->json(
                data: ['message' => 'Code expiré. Veuillez en demander un nouveau.'],
                status: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        } catch (MaxAttemptsOtpException) {
            return $this->json(
                data: ['message' => 'Nombre maximum de tentatives atteint. Veuillez renvoyer un nouveau code.'],
                status: Response::HTTP_TOO_MANY_REQUESTS,
            );
        } catch (InvalidPendingTokenException) {
            return $this->json(
                data: ['message' => 'Session invalide ou expirée.'],
                status: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $user = $otp->getUser();

        $token = $tokenRepository->getByUser($user);

        if ($token === null) {
            $token = new Token();
            $user->addToken($token);
        } else {
            $token->resetToken();
        }

        $tokenRepository->save($token, true);

        $res = $this->json(
            data: $user,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_otp_verify_login']],
        );

        $cookieService->addCookieToHeaders($token, $request, $res);

        return $res;
    }

    #[Route('/verify-email', name: 'api_otp_verify_email', methods: ['POST'])]
    public function verifyEmail(
        VerifyOtpRequestDTO $dto,
        OtpService $otpService,
        TokenRepository $tokenRepository,
        EntityManagerInterface $em,
        CookieService $cookieService,
        Request $request,
    ): JsonResponse {
        try {
            $otp = $otpService->verify($dto->getPendingOtpToken(), $dto->getCode());
        } catch (InvalidOtpException $e) {
            return $this->json(
                data: ['message' => 'Code incorrect.', 'remainingAttempts' => $e->getRemainingAttempts()],
                status: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        } catch (ExpiredOtpException) {
            return $this->json(
                data: ['message' => 'Code expiré. Veuillez en demander un nouveau.'],
                status: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        } catch (MaxAttemptsOtpException) {
            return $this->json(
                data: ['message' => 'Nombre maximum de tentatives atteint. Veuillez renvoyer un nouveau code.'],
                status: Response::HTTP_TOO_MANY_REQUESTS,
            );
        } catch (InvalidPendingTokenException) {
            return $this->json(
                data: ['message' => 'Session invalide ou expirée.'],
                status: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $user = $otp->getUser();
        $user->setVerifiedAt(DateHelper::createUtcDateTimeImmutable());

        $token = new Token();
        $user->addToken($token);
        $tokenRepository->save($token, true);

        $res = $this->json(
            data: $user,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_otp_verify_email']],
        );

        $cookieService->addCookieToHeaders($token, $request, $res);

        return $res;
    }

    #[Route('/verify-prelaunch', name: 'api_otp_verify_prelaunch', methods: ['POST'])]
    public function verifyPrelaunch(
        VerifyOtpRequestDTO $dto,
        OtpService $otpService,
        TokenRepository $tokenRepository,
        EntityManagerInterface $em,
        CookieService $cookieService,
        PrelaunchService $prelaunchService,
        Request $request,
    ): JsonResponse {
        try {
            $otp = $otpService->verify($dto->getPendingOtpToken(), $dto->getCode());
        } catch (InvalidOtpException $e) {
            return $this->json(
                data: ['message' => 'Code incorrect.', 'remainingAttempts' => $e->getRemainingAttempts()],
                status: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        } catch (ExpiredOtpException) {
            return $this->json(
                data: ['message' => 'Code expiré. Veuillez en demander un nouveau.'],
                status: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        } catch (MaxAttemptsOtpException) {
            return $this->json(
                data: ['message' => 'Nombre maximum de tentatives atteint. Veuillez renvoyer un nouveau code.'],
                status: Response::HTTP_TOO_MANY_REQUESTS,
            );
        } catch (InvalidPendingTokenException) {
            return $this->json(
                data: ['message' => 'Session invalide ou expirée.'],
                status: Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $user = $otp->getUser();
        $user->setVerifiedAt(DateHelper::createUtcDateTimeImmutable());

        $token = $tokenRepository->getByUser($user);

        if ($token === null) {
            $token = new Token();
            $user->addToken($token);
        } else {
            $token->resetToken();
        }

        $tokenRepository->save($token, true);

        $res = $this->json(
            data: $user,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_otp_verify_prelaunch']],
        );

        $cookieService->addCookieToHeaders($token, $request, $res);

        $referrer = $user->getReferredBy();
        if ($referrer !== null) {
            $prelaunchService->syncReferrerSegments($referrer);
        }

        return $res;
    }

    #[Route('/resend', name: 'api_otp_resend', methods: ['POST'])]
    public function resend(
        ResendOtpRequestDTO $dto,
        OtpRepository $otpRepository,
        OtpService $otpService,
    ): JsonResponse {
        $otp = $otpRepository->getByPendingOtpToken($dto->getPendingOtpToken());

        if ($otp === null || $otp->isUsed()) {
            return $this->json(
                data: ['message' => 'Session invalide ou expirée.'],
                status: Response::HTTP_UNAUTHORIZED,
            );
        }

        $user = $otp->getUser();
        $type = $otp->getType();

        $newOtp = $otpService->createAndSend($user, $type);

        $responseDto = new ResendOtpResponseDTO($newOtp->getPendingOtpToken());

        return $this->json(
            data: $responseDto->getData(),
            status: Response::HTTP_OK,
        );
    }
}
