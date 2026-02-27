<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptRetentionCue\ListScriptRetentionCuesQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\ScriptRetentionCue\CreateScriptRetentionCueRequestDTO;
use App\DTO\Request\ScriptRetentionCue\UpdateScriptRetentionCueRequestDTO;
use App\Entity\ScriptRetentionCue;
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

#[Route('/api/scripts/retention-cues', requirements: ['retentionCueUuid' => Requirement::UUID])]
final class ScriptRetentionCueController extends AbstractController
{
    #[Route('', name: 'api_scripts_retention_cues_list', methods: ['GET'])]
    public function list(
        ListScriptRetentionCuesQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptRetentionCueRepository $retentionCueRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $retentionCues = $retentionCueRepository->getByScriptAndUserOrderedByPosition($script, $user);

        return $this->json(
            data: $retentionCues,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_retention_cues_list']]
        );
    }

    #[Route('', name: 'api_scripts_retention_cues_create', methods: ['POST'])]
    public function create(
        CreateScriptRetentionCueRequestDTO $dto,
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
            /** @var ScriptRetentionCue $retentionCue */
            $retentionCue = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $retentionCue
            ->setUser($user)
            ->setScript($script);

        if ($dto->getPosition() !== null) {
            $retentionCue->setPosition($dto->getPosition());
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
            $retentionCue->setPosition($maxPosition + 1);
        }

        $retentionCueRepository->save($retentionCue, true);

        return $this->json(
            data: $retentionCue,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_retention_cues_create']]
        );
    }

    #[Route('/{retentionCueUuid}', name: 'api_scripts_retention_cues_update', methods: ['PATCH'])]
    public function update(
        string $retentionCueUuid,
        UpdateScriptRetentionCueRequestDTO $dto,
        ScriptRetentionCueRepository $retentionCueRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $retentionCue = $retentionCueRepository->getByUuidAndUser($retentionCueUuid, $user);

        if ($retentionCue === null) {
            return $this->json(data: ["message" => "You don't have any retention cue with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getContent() !== null && $dto->getContent() !== $retentionCue->getContent()) {
            $retentionCue->setContent($dto->getContent());
        }

        if ($dto->getRetentionCueType() !== null && $dto->getRetentionCueType() !== $retentionCue->getRetentionCueType()) {
            $retentionCue->setRetentionCueType($dto->getRetentionCueType());
        }

        $retentionCueRepository->save($retentionCue, true);

        return $this->json(
            data: $retentionCue,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_retention_cues_update']]
        );
    }

    #[Route('/{retentionCueUuid}', name: 'api_scripts_retention_cues_delete', methods: ['DELETE'])]
    public function delete(string $retentionCueUuid, ScriptRetentionCueRepository $retentionCueRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $retentionCue = $retentionCueRepository->getByUuidAndUser($retentionCueUuid, $user);

        if ($retentionCue === null) {
            return $this->json(data: ["message" => "You don't have any retention cue with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $retentionCueRepository->remove($retentionCue, true);

        return $this->json(data: ["message" => "Retention cue deleted successfully"], status: Response::HTTP_OK);
    }
}
