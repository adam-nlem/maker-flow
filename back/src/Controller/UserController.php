<?php

namespace App\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\User\RegisterUserRequestDTO;
use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
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
}
