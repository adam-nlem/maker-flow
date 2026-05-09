<?php

namespace App\Controller;

use App\DTO\QueryParam\ChatMessage\ListChatMessagesQueryParamDTO;
use App\DTO\Request\ChatMessage\CreateChatMessageRequestDTO;
use App\Entity\Message;
use App\Entity\User;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\Chat\ChatNotFoundException;
use App\Exception\Credit\InsufficientCreditsException;
use App\Message\GenerateChatMessageResponseMessage;
use App\Repository\AgencyRepository;
use App\Repository\ChatRepository;
use App\Repository\MessageRepository;
use App\Service\Credit\CreditService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/chat-messages', requirements: ['messageUuid' => Requirement::UUID])]
final class ChatMessageController extends AbstractController
{
    #[Route('', name: 'api_chat_messages_create', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function create(
        CreateChatMessageRequestDTO $dto,
        AgencyRepository $agencyRepository,
        ChatRepository $chatRepository,
        MessageRepository $messageRepository,
        CreditService $creditService,
        MessageBusInterface $messageBus,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $chat = $chatRepository->getAccessibleByUuidForUser($dto->getChatUuid(), $user);

        if ($chat === null) {
            throw new ChatNotFoundException();
        }

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        if ($creditService->getTotalCredits($agency) < 1) {
            throw new InsufficientCreditsException(requested: 1, available: $creditService->getTotalCredits($agency));
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

        $messageBus->dispatch(new GenerateChatMessageResponseMessage($message->getId()));

        return $this->json(
            data: $message,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_chat_messages_create']]
        );
    }

    #[Route('', name: 'api_chat_messages_list', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function list(
        ListChatMessagesQueryParamDTO $queryParamDto,
        ChatRepository $chatRepository,
        MessageRepository $messageRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $chat = $chatRepository->getAccessibleByUuidForUser($queryParamDto->getChatUuid(), $user);

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
            context: ['groups' => ['api_chat_messages_list']]
        );
    }
}
