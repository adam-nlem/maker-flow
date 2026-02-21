<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptShot\ListScriptShotsQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\ScriptShot\CreateScriptShotRequestDTO;
use App\DTO\Request\ScriptShot\UpdateScriptShotRequestDTO;
use App\Entity\ScriptShot;
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

#[Route('/api/scripts/shots', requirements: ['shotUuid' => Requirement::UUID])]
final class ScriptShotController extends AbstractController
{
    #[Route('', name: 'api_scripts_shots_list', methods: ['GET'])]
    public function list(
        ListScriptShotsQueryParamDTO $queryParamDto,
        ScriptRepository $scriptRepository,
        ScriptShotRepository $shotRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $script = $scriptRepository->getByUuidAndUser($queryParamDto->getScriptUuid(), $user);

        if ($script === null) {
            return $this->json(data: ["message" => "You don't have any script with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $shots = $shotRepository->getByScriptAndUserOrderedByPosition($script, $user);

        return $this->json(
            data: $shots,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_shots_list']]
        );
    }

    #[Route('', name: 'api_scripts_shots_create', methods: ['POST'])]
    public function create(
        CreateScriptShotRequestDTO $dto,
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
            /** @var ScriptShot $shot */
            $shot = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $shot
            ->setUser($user)
            ->setScript($script);

        if ($dto->getPosition() !== null) {
            $shot->setPosition($dto->getPosition());
        } else {
            $maxPosition = max(
                $chapterRepository->getMaxPositionByScript($script),
                $voiceOverRepository->getMaxPositionByScript($script),
                $dialogueRepository->getMaxPositionByScript($script),
                $shotRepository->getMaxPositionByScript($script),
            );
            $shot->setPosition($maxPosition + 1);
        }

        $shotRepository->save($shot, true);

        return $this->json(
            data: $shot,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_shots_create']]
        );
    }

    #[Route('/{shotUuid}', name: 'api_scripts_shots_update', methods: ['PATCH'])]
    public function update(
        string $shotUuid,
        UpdateScriptShotRequestDTO $dto,
        ScriptShotRepository $shotRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $shot = $shotRepository->getByUuidAndUser($shotUuid, $user);

        if ($shot === null) {
            return $this->json(data: ["message" => "You don't have any shot with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getContent() !== null && $dto->getContent() !== $shot->getContent()) {
            $shot->setContent($dto->getContent());
        }

        if ($dto->getShotType() !== null && $dto->getShotType() !== $shot->getShotType()) {
            $shot->setShotType($dto->getShotType());
        }

        $shotRepository->save($shot, true);

        return $this->json(
            data: $shot,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_shots_update']]
        );
    }

    #[Route('/{shotUuid}', name: 'api_scripts_shots_delete', methods: ['DELETE'])]
    public function delete(string $shotUuid, ScriptShotRepository $shotRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $shot = $shotRepository->getByUuidAndUser($shotUuid, $user);

        if ($shot === null) {
            return $this->json(data: ["message" => "You don't have any shot with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $shotRepository->remove($shot, true);

        return $this->json(data: ["message" => "Shot deleted successfully"], status: Response::HTTP_OK);
    }
}
