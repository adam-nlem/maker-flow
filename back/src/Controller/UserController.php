<?php

namespace App\Controller;

use App\DTO\Request\User\RegisterUserRequestDTO;
use App\DTO\Request\User\UpdateUserRequestDTO;
use App\DTO\Response\User\RegisterResponseDTO;
use App\Entity\Enum\OtpType;
use App\Entity\User;
use App\Exception\User\IncorrectCurrentPasswordException;
use App\Exception\User\InvalidPasswordException;
use App\Exception\User\MissingPasswordFieldsException;
use App\Exception\User\PasswordMismatchException;
use App\Helper\PasswordHelper;
use App\Repository\TokenRepository;
use App\Repository\UserRepository;
use App\Service\Cookie\CookieService;
use App\Service\Credit\CreditService;
use App\Service\Otp\OtpService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/users')]
final class UserController extends AbstractController
{
    #[Route('/logout', name: 'api_user_logout', methods: ["GET"])]
    public function logout(
        Request $request,
        CookieService $cookieService,
        TokenRepository $tokenRepository,
    ): JsonResponse {
        $token = $cookieService->getApiToken($request);

        if ($token) {
            $tokenRepository->remove($token, true);
        }

        $response = new JsonResponse(status: Response::HTTP_OK);
        $cookieService->clearCookie($request, $response);

        return $response;
    }

    #[Route('/register', name: 'api_user_register', methods: ["POST"])]
    public function register(
        RegisterUserRequestDTO $dto,
        UserRepository $userRepository,
        OtpService $otpService,
        CreditService $creditService,
    ): Response {
        if (!PasswordHelper::isValid($dto->getPlainPassword())) {
            throw new InvalidPasswordException();
        }

        /** @var User $user */
        $user = $dto->build();

        $userRepository->save($user, true);

        $creditService->addWelcomeCredits($user, 3);

        $otp = $otpService->createAndSend($user, OtpType::EmailVerification);

        $responseDto = new RegisterResponseDTO(true, $otp->getPendingOtpToken(), $user->getEmail());

        return $this->json(
            data: $responseDto->getData(),
            status: Response::HTTP_OK,
        );
    }

    #[Route('/me', name: 'api_user_me', methods: ["GET"])]
    public function me(): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json(data: $user, status: Response::HTTP_CREATED, context: ['groups' => ['api_user_me']]);
    }

    #[Route('', name: 'api_user_update', methods: ["PATCH"])]
    public function updateMe(
        UpdateUserRequestDTO $dto,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if ($dto->getFirstName() !== null) {
            $user->setFirstName($dto->getFirstName());
        }

        if ($dto->getLastName() !== null) {
            $user->setLastName($dto->getLastName());
        }

        if ($dto->getNewPassword() !== null) {
            if ($dto->getCurrentPassword() === null || $dto->getConfirmNewPassword() === null) {
                throw new MissingPasswordFieldsException();
            }

            if (!$passwordHasher->isPasswordValid($user, $dto->getCurrentPassword())) {
                throw new IncorrectCurrentPasswordException();
            }

            if ($dto->getNewPassword() !== $dto->getConfirmNewPassword()) {
                throw new PasswordMismatchException();
            }

            if (!PasswordHelper::isValid($dto->getNewPassword())) {
                throw new InvalidPasswordException();
            }

            $user->setPassword($passwordHasher->hashPassword($user, $dto->getNewPassword()));
        }

        $userRepository->save($user, true);

        return $this->json(data: $user, status: Response::HTTP_OK, context: ['groups' => ['api_user_update']]);
    }
}
