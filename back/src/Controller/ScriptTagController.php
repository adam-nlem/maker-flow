<?php

namespace App\Controller;

use App\DTO\QueryParam\ScriptTag\ListScriptTagsQueryParamDTO;
use App\DTO\Request\ScriptTag\CreateScriptTagRequestDTO;
use App\DTO\Request\ScriptTag\UpdateScriptTagRequestDTO;
use App\Entity\ScriptTag;
use App\Entity\User;
use App\Exception\Project\ProjectNotFoundException;
use App\Exception\Script\ScriptTagNotFoundException;
use App\Exception\Script\ScriptTagTitleConflictException;
use App\Repository\ProjectRepository;
use App\Repository\ScriptTagRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/scripts/tags', requirements: ['tagUuid' => Requirement::UUID])]
final class ScriptTagController extends AbstractController
{
    #[Route('', name: 'api_scripts_tags_list', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function list(
        ListScriptTagsQueryParamDTO $queryParamDto,
        ScriptTagRepository $tagRepository,
        ProjectRepository $projectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        if ($queryParamDto->getSearchTerm() !== null) {
            $tags = $tagRepository->getBySearchTermAndProjectLimited($queryParamDto->getSearchTerm(), $project, 20);
        } else {
            $tags = $tagRepository->getByProjectLimited($project, 20);
        }

        return $this->json(
            data: $tags,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_scripts_tags_list']]
        );
    }

    #[Route('', name: 'api_scripts_tags_create', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function create(
        CreateScriptTagRequestDTO $dto,
        ProjectRepository $projectRepository,
        ScriptTagRepository $tagRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        /** @var ScriptTag $tag */
        $tag = $dto->build();

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
    #[IsGranted('ROLE_EDITOR')]
    public function update(
        string $tagUuid,
        UpdateScriptTagRequestDTO $dto,
        ScriptTagRepository $tagRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $tag = $tagRepository->getAccessibleByUuidForUser($tagUuid, $user);

        if ($tag === null) {
            throw new ScriptTagNotFoundException();
        }

        if ($dto->getTitle() !== null && $dto->getTitle() != $tag->getTitle()) {
            $tagWithSameTitle = $tagRepository->getByTitleAndProject($dto->getTitle(), $tag->getProject());
            if ($tagWithSameTitle !== null) {
                throw new ScriptTagTitleConflictException();
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
    #[IsGranted('ROLE_EDITOR')]
    public function delete(string $tagUuid, ScriptTagRepository $tagRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $tag = $tagRepository->getAccessibleByUuidForUser($tagUuid, $user);

        if ($tag === null) {
            throw new ScriptTagNotFoundException();
        }

        $tagRepository->remove($tag, true);

        return $this->json(data: ['message' => 'Tag deleted successfully'], status: Response::HTTP_OK);
    }
}
