<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptVoiceOver\ListScriptVoiceOversQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\ScriptVoiceOver\CreateScriptVoiceOverRequestDTO;
use App\DTO\Request\ScriptVoiceOver\UpdateScriptVoiceOverRequestDTO;
use App\Entity\ScriptVoiceOver;
use App\Entity\User;
use App\Repository\ScriptChapterRepository;
use App\Repository\ScriptDialogueRepository;
use App\Repository\ScriptRepository;
use App\Repository\ScriptShotRepository;
use App\Repository\ScriptVoiceOverRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/scripts/voice-overs', requirements: ['voiceOverUuid' => Requirement::UUID])]
final class ScriptVoiceOverController extends AbstractController
{
    #[Route('', name: 'api_scripts_voice_overs_list', methods: ['GET'])]
    public function list(
        ListScriptVoiceOversQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptVoiceOverRepository $voiceOverRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $voiceOvers = $voiceOverRepository->getByScriptAndUserOrderedByPosition($script, $user);

        return $this->json(
            data: $voiceOvers,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_voice_overs_list']]
        );
    }

    #[Route('', name: 'api_scripts_voice_overs_create', methods: ['POST'])]
    public function create(
        CreateScriptVoiceOverRequestDTO $dto,
        ScriptRepository $scriptRepository,
        ScriptChapterRepository $chapterRepository,
        ScriptVoiceOverRepository $voiceOverRepository,
        ScriptDialogueRepository $dialogueRepository,
        ScriptShotRepository $shotRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($dto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var ScriptVoiceOver $voiceOver */
            $voiceOver = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $voiceOver
            ->setUser($user)
            ->setScript($script);

        if ($dto->getPosition() !== null) {
            $voiceOver->setPosition($dto->getPosition());
        } else {
            $maxPosition = max(
                $chapterRepository->getMaxPositionByScript($script),
                $voiceOverRepository->getMaxPositionByScript($script),
                $dialogueRepository->getMaxPositionByScript($script),
                $shotRepository->getMaxPositionByScript($script),
            );
            $voiceOver->setPosition($maxPosition + 1);
        }

        $voiceOverRepository->save($voiceOver, true);

        return $this->json(
            data: $voiceOver,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_voice_overs_create']]
        );
    }

    #[Route('/{voiceOverUuid}', name: 'api_scripts_voice_overs_update', methods: ['PATCH'])]
    public function update(
        string $voiceOverUuid,
        UpdateScriptVoiceOverRequestDTO $dto,
        ScriptVoiceOverRepository $voiceOverRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $voiceOver = $voiceOverRepository->getByUuidAndUser($voiceOverUuid, $user);

        if ($voiceOver === null) {
            return $this->json(data: ["message" => "You don't have any voice-over with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getContent() !== null && $dto->getContent() !== $voiceOver->getContent()) {
            $voiceOver->setContent($dto->getContent());
        }

        if ($dto->getVoiceOverType() !== null && $dto->getVoiceOverType() !== $voiceOver->getVoiceOverType()) {
            $voiceOver->setVoiceOverType($dto->getVoiceOverType());
        }

        $voiceOverRepository->save($voiceOver, true);

        return $this->json(
            data: $voiceOver,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_voice_overs_update']]
        );
    }

    #[Route('/{voiceOverUuid}', name: 'api_scripts_voice_overs_delete', methods: ['DELETE'])]
    public function delete(string $voiceOverUuid, ScriptVoiceOverRepository $voiceOverRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $voiceOver = $voiceOverRepository->getByUuidAndUser($voiceOverUuid, $user);

        if ($voiceOver === null) {
            return $this->json(data: ["message" => "You don't have any voice-over with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $voiceOverRepository->remove($voiceOver, true);

        return $this->json(data: ["message" => "Voice-over deleted successfully"], status: Response::HTTP_OK);
    }
}
