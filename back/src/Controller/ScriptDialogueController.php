<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptDialogue\ListScriptDialoguesQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\ScriptDialogue\CreateScriptDialogueRequestDTO;
use App\DTO\Request\ScriptDialogue\UpdateScriptDialogueRequestDTO;
use App\Entity\ScriptDialogue;
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

#[Route('/api/scripts/dialogues')]
final class ScriptDialogueController extends AbstractController
{
    #[Route('', name: 'api_scripts_dialogues_list', methods: ['GET'])]
    public function list(
        ListScriptDialoguesQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptDialogueRepository $dialogueRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $dialogues = $dialogueRepository->getByScriptAndUserOrderedByPosition($script, $user);

        return $this->json(
            data: $dialogues,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_dialogues_list']]
        );
    }

    #[Route('', name: 'api_scripts_dialogues_create', methods: ['POST'])]
    public function create(
        CreateScriptDialogueRequestDTO $dto,
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
            /** @var ScriptDialogue $dialogue */
            $dialogue = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $dialogue
            ->setUser($user)
            ->setScript($script);

        if ($dto->getPosition() !== null) {
            $dialogue->setPosition($dto->getPosition());
        } else {
            $maxPosition = max(
                $chapterRepository->getMaxPositionByScript($script),
                $voiceOverRepository->getMaxPositionByScript($script),
                $dialogueRepository->getMaxPositionByScript($script),
                $shotRepository->getMaxPositionByScript($script),
            );
            $dialogue->setPosition($maxPosition + 1);
        }

        $dialogueRepository->save($dialogue, true);

        return $this->json(
            data: $dialogue,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_dialogues_create']]
        );
    }

    #[Route('/{uuid}', name: 'api_scripts_dialogues_update', methods: ['PATCH'])]
    public function update(
        string $uuid,
        UpdateScriptDialogueRequestDTO $dto,
        ScriptDialogueRepository $dialogueRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $dialogue = $dialogueRepository->getByUuidAndUser($uuid, $user);

        if ($dialogue === null) {
            return $this->json(data: ["message" => "You don't have any dialogue with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getTitle() !== null && $dto->getTitle() !== $dialogue->getTitle()) {
            $dialogue->setTitle($dto->getTitle());
        }

        if ($dto->getDescription() !== null) {
            $dialogue->setDescription($dto->getDescription());
        }

        $dialogueRepository->save($dialogue, true);

        return $this->json(
            data: $dialogue,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_dialogues_update']]
        );
    }

    #[Route('/{uuid}', name: 'api_scripts_dialogues_delete', methods: ['DELETE'])]
    public function delete(string $uuid, ScriptDialogueRepository $dialogueRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $dialogue = $dialogueRepository->getByUuidAndUser($uuid, $user);

        if ($dialogue === null) {
            return $this->json(data: ["message" => "You don't have any dialogue with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $dialogueRepository->remove($dialogue, true);

        return $this->json(data: ["message" => "Dialogue deleted successfully"], status: Response::HTTP_OK);
    }
}
