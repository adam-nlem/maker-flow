<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptTag\ListScriptTagsQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\ScriptTag\CreateScriptTagRequestDTO;
use App\DTO\Request\ScriptTag\UpdateScriptTagRequestDTO;
use App\Entity\ScriptTag;
use App\Entity\User;
use App\Repository\ProjectRepository;
use App\Repository\ScriptTagRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/scripts/tags')]
final class ScriptTagController extends AbstractController
{
    #[Route('', name: 'api_scripts_tags_list', methods: ['GET'])]
    public function list(
        ListScriptTagsQueryParamDTO $queryParamDto,
        ScriptTagRepository $tagRepository,
        ProjectRepository $projectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($queryParamDto->getSearchTerm() !== null) {
            $tags = $tagRepository->getBySearchTermAndUserAndProjectLimited($queryParamDto->getSearchTerm(), $user, $project, 20);
        } else {
            $tags = $tagRepository->getByUserAndProjectLimited($user, $project, 20);
        }

        return $this->json(
            data: $tags,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_tags_list']]
        );
    }

    #[Route('', name: 'api_scripts_tags_create', methods: ['POST'])]
    public function create(
        CreateScriptTagRequestDTO $dto,
        ProjectRepository $projectRepository,
        ScriptTagRepository $tagRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var ScriptTag $tag */
            $tag = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $tag
            ->setUser($user)
            ->setProject($project);

        $tagRepository->save($tag, true);

        return $this->json(
            data: $tag,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_tags_create']]
        );
    }

    #[Route('/{tagUuid}', name: 'api_scripts_tags_update', methods: ['PATCH'])]
    public function update(
        string $tagUuid,
        UpdateScriptTagRequestDTO $dto,
        ScriptTagRepository $tagRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $tag = $tagRepository->getByUuidAndUser($tagUuid, $user);

        if ($tag === null) {
            return $this->json(data: ["message" => "You don't have any tag with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getTitle() !== null && $dto->getTitle() != $tag->getTitle()) {
            $tagWithSameTitle = $tagRepository->getByTitleAndProjectAndUser($dto->getTitle(), $tag->getProject(), $user);
            if ($tagWithSameTitle !== null) {
                return $this->json(data: ["message" => "You already use this title for another tag in this project"], status: Response::HTTP_CONFLICT);
            }
            $tag->setTitle($dto->getTitle());
        }

        if ($dto->getColor() !== null && $dto->getColor() !== $tag->getColor()) {
            $tag->setColor($dto->getColor());
        }

        $tagRepository->save($tag, true);

        return $this->json(data: $tag, status: Response::HTTP_OK, context: ['groups' => ['api_scripts_tags_update']]);
    }

    #[Route('/{tagUuid}', name: 'api_scripts_tags_delete', methods: ['DELETE'])]
    public function delete(string $tagUuid, ScriptTagRepository $tagRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $tag = $tagRepository->getByUuidAndUser($tagUuid, $user);

        if ($tag === null) {
            return $this->json(data: ["message" => "You don't have any tag with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $tagRepository->remove($tag, true);

        return $this->json(data: ['message' => 'Tag deleted successfully'], status: Response::HTTP_OK);
    }
}
