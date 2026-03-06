<?php

namespace App\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\User\RegisterUserRequestDTO;
use App\DTO\Request\User\UpdateUserRequestDTO;
use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/users')]
final class UserController extends AbstractController
{
    #[Route('/register', name: 'api_user_register', methods: ["POST"])]
    public function register(
        RegisterUserRequestDTO $dto,
        UserRepository $userRepository,
    ): Response {
        try {
            /** @var User $user */
            $user = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $userRepository->save($user, true);

        return $this->json(data: $user, status: Response::HTTP_OK, context: ['groups' => ['api_user_register']]);
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
                return $this->json(data: ["message" => "All three password fields are required."], status: Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if (!$passwordHasher->isPasswordValid($user, $dto->getCurrentPassword())) {
                return $this->json(data: ["message" => "Current password is incorrect."], status: Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if ($dto->getNewPassword() !== $dto->getConfirmNewPassword()) {
                return $this->json(data: ["message" => "Passwords do not match."], status: Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if (strlen($dto->getNewPassword()) < 8) {
                return $this->json(data: ["message" => "New password must be at least 8 characters long."], status: Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $user->setPassword($passwordHasher->hashPassword($user, $dto->getNewPassword()));
        }

        $userRepository->save($user, true);

        return $this->json(data: $user, status: Response::HTTP_OK, context: ['groups' => ['api_user_update']]);
    }
}
