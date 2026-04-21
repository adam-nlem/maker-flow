<?php

namespace App\Controller;

use App\DTO\QueryParam\Message\ListMessagesQueryParamDTO;
use App\DTO\Request\Message\CreateMessageRequestDTO;
use App\Entity\Message;
use App\Entity\User;
use App\Exception\Chat\ChatNotFoundException;
use App\Repository\ChatRepository;
use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/chat-messages', requirements: ['messageUuid' => Requirement::UUID])]
final class ChatMessageController extends AbstractController
{
    #[Route('', name: 'api_messages_create', methods: ['POST'])]
    public function create(
        CreateMessageRequestDTO $dto,
        ChatRepository $chatRepository,
        MessageRepository $messageRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $chat = $chatRepository->getByUuidAndUser($dto->getChatUuid(), $user);

        if ($chat === null) {
            throw new ChatNotFoundException();
        }

        /** @var Message $message */
        $message = $dto->build();

        $message
            ->setUser($user)
            ->setChat($chat);

        if ($dto->getParentMessageUuid() !== null) {
            $parentMessage = $messageRepository->getByUuidAndChat($dto->getParentMessageUuid(), $chat);

            if ($parentMessage !== null) {
                $message->setParentMessage($parentMessage);
            }
        }

        $messageRepository->save($message, true);

        return $this->json(
            data: $message,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_messages_create']]
        );
    }

    #[Route('', name: 'api_messages_list', methods: ['GET'])]
    public function list(
        ListMessagesQueryParamDTO $queryParamDto,
        ChatRepository $chatRepository,
        MessageRepository $messageRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $chat = $chatRepository->getByUuidAndUser($queryParamDto->getChatUuid(), $user);

        if ($chat === null) {
            throw new ChatNotFoundException();
        }

        $messages = $messageRepository->getByChatPaginated(
            $chat,
            $queryParamDto->getPage(),
            $queryParamDto->getLimit()
        );

        return $this->json(
            data: $messages,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_messages_list']]
        );
    }
}
