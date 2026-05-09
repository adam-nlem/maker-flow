<?php

namespace App\Controller;

use App\DTO\QueryParam\Chat\ListChatsQueryParamDTO;
use App\DTO\Request\Chat\CreateChatRequestDTO;
use App\DTO\Request\Chat\UpdateChatRequestDTO;
use App\Entity\Chat;
use App\Entity\User;
use App\Exception\Chat\ChatNotFoundException;
use App\Exception\Script\ScriptNotFoundException;
use App\Repository\ChatRepository;
use App\Repository\ScriptRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/chats', requirements: ['chatUuid' => Requirement::UUID])]
final class ChatController extends AbstractController
{
    #[Route('', name: 'api_chats_create', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function create(
        CreateChatRequestDTO $dto,
        ScriptRepository $scriptRepository,
        ChatRepository $chatRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getAccessibleByUuidForUser($dto->getScriptUuid(), $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        /** @var Chat $chat */
        $chat = $dto->build();

        $chat
            ->setUser($user)
            ->setScript($script);

        $chatRepository->save($chat, true);

        return $this->json(
            data: $chat,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_chats_create']]
        );
    }

    #[Route('', name: 'api_chats_list', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function list(
        ListChatsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ChatRepository $chatRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getAccessibleByUuidForUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        $chats = $chatRepository->getByScriptPaginated(
            $script,
            $queryParamDto->getPage(),
            $queryParamDto->getLimit()
        );

        return $this->json(
            data: $chats,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_chats_list']]
        );
    }

    #[Route('/{chatUuid}', name: 'api_chats_show', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function show(
        string $chatUuid,
        ChatRepository $chatRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $chat = $chatRepository->getAccessibleByUuidForUser($chatUuid, $user);

        if ($chat === null) {
            throw new ChatNotFoundException();
        }

        return $this->json(
            data: $chat,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_chats_show']]
        );
    }

    #[Route('/{chatUuid}', name: 'api_chats_update', methods: ['PATCH'])]
    #[IsGranted('ROLE_EDITOR')]
    public function update(
        string $chatUuid,
        UpdateChatRequestDTO $dto,
        ChatRepository $chatRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $chat = $chatRepository->getAccessibleByUuidForUser($chatUuid, $user);

        if ($chat === null) {
            throw new ChatNotFoundException();
        }

        if ($dto->getTitle() !== null && $dto->getTitle() !== $chat->getTitle()) {
            $chat->setTitle($dto->getTitle());
        }

        $chatRepository->save($chat, true);

        return $this->json(
            data: $chat,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_chats_update']]
        );
    }

    #[Route('/{chatUuid}', name: 'api_chats_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_EDITOR')]
    public function delete(
        string $chatUuid,
        ChatRepository $chatRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $chat = $chatRepository->getAccessibleByUuidForUser($chatUuid, $user);

        if ($chat === null) {
            throw new ChatNotFoundException();
        }

        $chatRepository->remove($chat, true);

        return $this->json(data: ["message" => "Chat deleted successfully"], status: Response::HTTP_OK);
    }
}
