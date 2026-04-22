<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptVersion\ListScriptVersionsQueryParamDTO;
use App\DTO\Request\ScriptVersion\ApplyHookSuggestionRequestDTO;
use App\DTO\Request\ScriptVersion\UpdateScriptVersionRequestDTO;
use App\Entity\Enum\ScriptVersionStatus;
use App\Entity\User;
use App\Exception\Chat\ChatNotFoundException;
use App\Exception\Script\ScriptNotFoundException;
use App\Exception\ScriptVersion\ScriptVersionNotDraftException;
use App\Exception\ScriptVersion\ScriptVersionNotFoundException;
use App\Repository\ChatRepository;
use App\Repository\MessageRepository;
use App\Repository\ScriptRepository;
use App\Repository\ScriptVersionRepository;
use App\Service\ScriptVersion\ScriptVersionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/script-versions', requirements: ['versionUuid' => Requirement::UUID])]
final class ScriptVersionController extends AbstractController
{
    #[Route('', name: 'api_script_versions_list', methods: ['GET'])]
    public function list(
        ListScriptVersionsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptVersionRepository $scriptVersionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            throw new ScriptNotFoundException();
        }

        $scriptVersions = $scriptVersionRepository->getByScriptAndUserPaginated(
            $script,
            $user,
            $queryParamDto->getPage(),
            $queryParamDto->getLimit()
        );

        return $this->json(
            data: $scriptVersions,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_versions_list']]
        );
    }

    #[Route('/{versionUuid}', name: 'api_script_versions_show', methods: ['GET'])]
    public function show(
        string $versionUuid,
        ScriptVersionRepository $scriptVersionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $scriptVersion = $scriptVersionRepository->getByUuidAndUser($versionUuid, $user);

        if ($scriptVersion === null) {
            throw new ScriptVersionNotFoundException();
        }

        return $this->json(
            data: $scriptVersion,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_versions_show']]
        );
    }

    #[Route('/{versionUuid}', name: 'api_script_versions_update', methods: ['PATCH'])]
    public function update(
        string $versionUuid,
        UpdateScriptVersionRequestDTO $dto,
        ScriptVersionRepository $scriptVersionRepository,
        ScriptVersionService $scriptVersionService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $scriptVersion = $scriptVersionRepository->getByUuidAndUser($versionUuid, $user);

        if ($scriptVersion === null) {
            throw new ScriptVersionNotFoundException();
        }

        if ($scriptVersion->getStatus() !== ScriptVersionStatus::Draft) {
            throw new ScriptVersionNotDraftException();
        }

        if ($dto->getStatus() === ScriptVersionStatus::Accepted) {
            $scriptVersionService->acceptVersion($scriptVersion);
        } elseif ($dto->getStatus() === ScriptVersionStatus::Rejected) {
            $scriptVersionService->rejectVersion($scriptVersion);
        }

        return $this->json(
            data: $scriptVersion,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_script_versions_update']]
        );
    }

    #[Route('/apply-hook-suggestion', name: 'api_script_versions_apply_hook_suggestion', methods: ['POST'])]
    public function applyHookSuggestion(
        ApplyHookSuggestionRequestDTO $dto,
        ChatRepository $chatRepository,
        MessageRepository $messageRepository,
        ScriptVersionService $scriptVersionService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $chat = $chatRepository->getByUuidAndUser($dto->getChatUuid(), $user);

        if ($chat === null) {
            throw new ChatNotFoundException();
        }

        $aiMessage = $messageRepository->getByUuidAndChat($dto->getMessageUuid(), $chat);

        if ($aiMessage === null) {
            throw new ScriptVersionNotFoundException();
        }

        $scriptVersion = $scriptVersionService->applyHookSuggestion($chat, $aiMessage, $dto->getHookContent(), $user);

        return $this->json(
            data: $scriptVersion,
            status: Response::HTTP_CREATED,
            context: ['groups' => ['api_script_versions_show']]
        );
    }
}
