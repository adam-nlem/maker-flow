<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptChapter\ListScriptChaptersQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\ScriptChapter\CreateScriptChapterRequestDTO;
use App\DTO\Request\ScriptChapter\UpdateScriptChapterRequestDTO;
use App\Entity\ScriptChapter;
use App\Entity\User;
use App\Repository\ScriptChapterRepository;
use App\Repository\ScriptDialogueRepository;
use App\Repository\ScriptRepository;
use App\Repository\ScriptShotRepository;
use App\Repository\ScriptTextRepository;
use App\Repository\ScriptVoiceOverRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/scripts/chapters', requirements: ['chapterUuid' => Requirement::UUID])]
final class ScriptChapterController extends AbstractController
{
    #[Route('', name: 'api_scripts_chapters_list', methods: ['GET'])]
    public function list(
        ListScriptChaptersQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptChapterRepository $chapterRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $chapters = $chapterRepository->getByScriptAndUserOrderedByPosition($script, $user);

        return $this->json(
            data: $chapters,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_chapters_list']]
        );
    }

    #[Route('', name: 'api_scripts_chapters_create', methods: ['POST'])]
    public function create(
        CreateScriptChapterRequestDTO $dto,
        ScriptRepository $scriptRepository,
        ScriptChapterRepository $chapterRepository,
        ScriptVoiceOverRepository $voiceOverRepository,
        ScriptDialogueRepository $dialogueRepository,
        ScriptShotRepository $shotRepository,
        ScriptTextRepository $textRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($dto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var ScriptChapter $chapter */
            $chapter = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $chapter
            ->setUser($user)
            ->setScript($script);

        if ($dto->getPosition() !== null) {
            $chapter->setPosition($dto->getPosition());
        } else {
            $maxPosition = max(
                $chapterRepository->getMaxPositionByScript($script),
                $voiceOverRepository->getMaxPositionByScript($script),
                $dialogueRepository->getMaxPositionByScript($script),
                $shotRepository->getMaxPositionByScript($script),
                $textRepository->getMaxPositionByScript($script),
            );
            $chapter->setPosition($maxPosition + 1);
        }

        $chapterRepository->save($chapter, true);

        return $this->json(
            data: $chapter,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_chapters_create']]
        );
    }

    #[Route('/{chapterUuid}', name: 'api_scripts_chapters_update', methods: ['PATCH'])]
    public function update(
        string $chapterUuid,
        UpdateScriptChapterRequestDTO $dto,
        ScriptChapterRepository $chapterRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $chapter = $chapterRepository->getByUuidAndUser($chapterUuid, $user);

        if ($chapter === null) {
            return $this->json(data: ["message" => "You don't have any chapter with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getTitle() !== null && $dto->getTitle() !== $chapter->getTitle()) {
            $chapter->setTitle($dto->getTitle());
        }

        if ($dto->getDescription() !== null) {
            $chapter->setDescription($dto->getDescription());
        }

        if ($dto->getChapterType() !== null && $dto->getChapterType() !== $chapter->getChapterType()) {
            $chapter->setChapterType($dto->getChapterType());
        }

        $chapterRepository->save($chapter, true);

        return $this->json(
            data: $chapter,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_chapters_update']]
        );
    }

    #[Route('/{chapterUuid}', name: 'api_scripts_chapters_delete', methods: ['DELETE'])]
    public function delete(string $chapterUuid, ScriptChapterRepository $chapterRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $chapter = $chapterRepository->getByUuidAndUser($chapterUuid, $user);

        if ($chapter === null) {
            return $this->json(data: ["message" => "You don't have any chapter with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $chapterRepository->remove($chapter, true);

        return $this->json(data: ["message" => "Chapter deleted successfully"], status: Response::HTTP_OK);
    }
}
