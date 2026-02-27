<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptCallToAction\ListScriptCallToActionsQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\ScriptCallToAction\CreateScriptCallToActionRequestDTO;
use App\DTO\Request\ScriptCallToAction\UpdateScriptCallToActionRequestDTO;
use App\Entity\ScriptCallToAction;
use App\Entity\User;
use App\Repository\ScriptCallToActionRepository;
use App\Repository\ScriptChapterRepository;
use App\Repository\ScriptDialogueRepository;
use App\Repository\ScriptRepository;
use App\Repository\ScriptRetentionCueRepository;
use App\Repository\ScriptShotRepository;
use App\Repository\ScriptTextRepository;
use App\Repository\ScriptVoiceOverRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/scripts/call-to-actions', requirements: ['callToActionUuid' => Requirement::UUID])]
final class ScriptCallToActionController extends AbstractController
{
    #[Route('', name: 'api_scripts_call_to_actions_list', methods: ['GET'])]
    public function list(
        ListScriptCallToActionsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptCallToActionRepository $callToActionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $callToActions = $callToActionRepository->getByScriptAndUserOrderedByPosition($script, $user);

        return $this->json(
            data: $callToActions,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_call_to_actions_list']]
        );
    }

    #[Route('', name: 'api_scripts_call_to_actions_create', methods: ['POST'])]
    public function create(
        CreateScriptCallToActionRequestDTO $dto,
        ScriptRepository $scriptRepository,
        ScriptChapterRepository $chapterRepository,
        ScriptVoiceOverRepository $voiceOverRepository,
        ScriptDialogueRepository $dialogueRepository,
        ScriptShotRepository $shotRepository,
        ScriptTextRepository $textRepository,
        ScriptCallToActionRepository $callToActionRepository,
        ScriptRetentionCueRepository $retentionCueRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($dto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var ScriptCallToAction $callToAction */
            $callToAction = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $callToAction
            ->setUser($user)
            ->setScript($script);

        if ($dto->getPosition() !== null) {
            $callToAction->setPosition($dto->getPosition());
        } else {
            $maxPosition = max(
                $chapterRepository->getMaxPositionByScript($script),
                $voiceOverRepository->getMaxPositionByScript($script),
                $dialogueRepository->getMaxPositionByScript($script),
                $shotRepository->getMaxPositionByScript($script),
                $textRepository->getMaxPositionByScript($script),
                $callToActionRepository->getMaxPositionByScript($script),
                $retentionCueRepository->getMaxPositionByScript($script),
            );
            $callToAction->setPosition($maxPosition + 1);
        }

        $callToActionRepository->save($callToAction, true);

        return $this->json(
            data: $callToAction,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_call_to_actions_create']]
        );
    }

    #[Route('/{callToActionUuid}', name: 'api_scripts_call_to_actions_update', methods: ['PATCH'])]
    public function update(
        string $callToActionUuid,
        UpdateScriptCallToActionRequestDTO $dto,
        ScriptCallToActionRepository $callToActionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $callToAction = $callToActionRepository->getByUuidAndUser($callToActionUuid, $user);

        if ($callToAction === null) {
            return $this->json(data: ["message" => "You don't have any call to action with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getContent() !== null && $dto->getContent() !== $callToAction->getContent()) {
            $callToAction->setContent($dto->getContent());
        }

        if ($dto->getCallToActionType() !== null && $dto->getCallToActionType() !== $callToAction->getCallToActionType()) {
            $callToAction->setCallToActionType($dto->getCallToActionType());
        }

        $callToActionRepository->save($callToAction, true);

        return $this->json(
            data: $callToAction,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_call_to_actions_update']]
        );
    }

    #[Route('/{callToActionUuid}', name: 'api_scripts_call_to_actions_delete', methods: ['DELETE'])]
    public function delete(string $callToActionUuid, ScriptCallToActionRepository $callToActionRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $callToAction = $callToActionRepository->getByUuidAndUser($callToActionUuid, $user);

        if ($callToAction === null) {
            return $this->json(data: ["message" => "You don't have any call to action with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $callToActionRepository->remove($callToAction, true);

        return $this->json(data: ["message" => "Call to action deleted successfully"], status: Response::HTTP_OK);
    }
}
