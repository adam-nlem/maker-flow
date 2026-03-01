<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptText\ListScriptTextsQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\ScriptText\CreateScriptTextRequestDTO;
use App\DTO\Request\ScriptText\UpdateScriptTextRequestDTO;
use App\Entity\ScriptText;
use App\Entity\User;
use App\Repository\ScriptChapterRepository;
use App\Repository\ScriptDialogueRepository;
use App\Repository\ScriptGenerationRepository;
use App\Repository\ScriptHookRepository;
use App\Repository\ScriptRepository;
use App\Repository\ScriptShotRepository;
use App\Repository\ScriptTextRepository;
use App\Repository\ScriptVoiceOverRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/scripts/texts', requirements: ['textUuid' => Requirement::UUID])]
final class ScriptTextController extends AbstractController
{
    #[Route('', name: 'api_scripts_texts_list', methods: ['GET'])]
    public function list(
        ListScriptTextsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptTextRepository $textRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $texts = $textRepository->getByScriptAndUserOrderedByPosition($script, $user);

        return $this->json(
            data: $texts,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_texts_list']]
        );
    }

    #[Route('', name: 'api_scripts_texts_create', methods: ['POST'])]
    public function create(
        CreateScriptTextRequestDTO $dto,
        ScriptRepository $scriptRepository,
        ScriptGenerationRepository $generationRepository,
        ScriptChapterRepository $chapterRepository,
        ScriptVoiceOverRepository $voiceOverRepository,
        ScriptDialogueRepository $dialogueRepository,
        ScriptShotRepository $shotRepository,
        ScriptTextRepository $textRepository,
        ScriptHookRepository $hookRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($dto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var ScriptText $text */
            $text = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $text
            ->setUser($user)
            ->setScript($script);

        $generation = null;
        if ($dto->getGenerationUuid() !== null) {
            $generation = $generationRepository->getByUuidAndUser($dto->getGenerationUuid(), $user);
            if ($generation === null) {
                return $this->json(data: ["message" => "You don't have any generation with this uuid"], status: Response::HTTP_NOT_FOUND);
            }
            $text->setScriptGeneration($generation);
        }

        if ($dto->getPosition() !== null) {
            $text->setPosition($dto->getPosition());
        } else {
            $maxPosition = max(
                $chapterRepository->getMaxPositionByScriptAndGeneration($script, $generation),
                $voiceOverRepository->getMaxPositionByScriptAndGeneration($script, $generation),
                $dialogueRepository->getMaxPositionByScriptAndGeneration($script, $generation),
                $shotRepository->getMaxPositionByScriptAndGeneration($script, $generation),
                $textRepository->getMaxPositionByScriptAndGeneration($script, $generation),
                $hookRepository->getMaxPositionByScriptAndGeneration($script, $generation),
            );
            $text->setPosition($maxPosition + 1);
        }

        $textRepository->save($text, true);

        return $this->json(
            data: $text,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_texts_create']]
        );
    }

    #[Route('/{textUuid}', name: 'api_scripts_texts_update', methods: ['PATCH'])]
    public function update(
        string $textUuid,
        UpdateScriptTextRequestDTO $dto,
        ScriptTextRepository $textRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $text = $textRepository->getByUuidAndUser($textUuid, $user);

        if ($text === null) {
            return $this->json(data: ["message" => "You don't have any text with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getContent() !== null && $dto->getContent() !== $text->getContent()) {
            $text->setContent($dto->getContent());
        }

        $textRepository->save($text, true);

        return $this->json(
            data: $text,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_texts_update']]
        );
    }

    #[Route('/{textUuid}', name: 'api_scripts_texts_delete', methods: ['DELETE'])]
    public function delete(string $textUuid, ScriptTextRepository $textRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $text = $textRepository->getByUuidAndUser($textUuid, $user);

        if ($text === null) {
            return $this->json(data: ["message" => "You don't have any text with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $textRepository->remove($text, true);

        return $this->json(data: ["message" => "Text deleted successfully"], status: Response::HTTP_OK);
    }
}
