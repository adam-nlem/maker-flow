<?php

namespace App\Controller;

use App\DTO\QueryParam\PostGroup\ListPostGroupsQueryParamDTO;
use App\DTO\QueryParam\PostGroup\RankPostGroupsQueryParamDTO;
use App\DTO\Request\Exception\CustomValidationException;
use App\DTO\Request\PostGroup\CreatePostGroupRequestDTO;
use App\DTO\Request\PostGroup\UpdatePostGroupRequestDTO;
use App\Entity\PostGroup;
use App\Entity\User;
use App\Repository\PostGroupRepository;
use App\Repository\PostRepository;
use App\Repository\ProjectRepository;
use App\Repository\SubscriptionRepository;
use App\Service\PostGroup\PostGroupService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/post-groups', requirements: ['postGroupUuid' => Requirement::UUID])]
final class PostGroupController extends AbstractController
{
    public function __construct(private PostGroupService $service) {}

    #[Route('', name: 'api_post_groups_list', methods: ['GET'])]
    public function list(
        ListPostGroupsQueryParamDTO $queryParamDto,
        PostGroupRepository $postGroupRepository,
        ProjectRepository $projectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $postGroups = $postGroupRepository->getByProjectAndUser($project, $user);

        return $this->json(
            data: $postGroups,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_groups_list']]
        );
    }

    #[Route('/rank', name: 'api_post_groups_rank', methods: ['GET'])]
    public function rank(
        RankPostGroupsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
        SubscriptionRepository $subscriptionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if ($subscriptionRepository->getLatestActiveByUser($user) === null) {
            return $this->json(
                data: ["message" => "Active subscription required."],
                status: Response::HTTP_PAYMENT_REQUIRED,
            );
        }

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $result = $this->service->getRankedPostGroups($user, $project, $queryParamDto->getPage(), $queryParamDto->getLimit());

        return $this->json(
            data: $result,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_groups_rank']],
        );
    }

    #[Route('', name: 'api_post_groups_create', methods: ['POST'])]
    public function create(
        CreatePostGroupRequestDTO $dto,
        ProjectRepository $projectRepository,
        PostGroupRepository $postGroupRepository,
        PostRepository $postRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            return $this->json(data: ["message" => "You don't have any project with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var PostGroup $postGroup */
            $postGroup = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $postGroup
            ->setUser($user)
            ->setProject($project);

        $posts = $postRepository->getByUuidsAndUser($dto->getPostUuids(), $user);

        foreach ($posts as $post) {
            $post->setPostGroup($postGroup);
        }

        $postGroupRepository->save($postGroup, true);

        return $this->json(
            data: $postGroup,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_groups_create']]
        );
    }

    #[Route('/{postGroupUuid}', name: 'api_post_groups_update', methods: ['PATCH'])]
    public function update(
        string $postGroupUuid,
        UpdatePostGroupRequestDTO $dto,
        PostGroupRepository $postGroupRepository,
        PostRepository $postRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $postGroup = $postGroupRepository->getByUuidAndUser($postGroupUuid, $user);

        if ($postGroup === null) {
            return $this->json(data: ["message" => "You don't have any post group with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getTitle() !== null && $dto->getTitle() !== $postGroup->getTitle()) {
            $postGroup->setTitle($dto->getTitle());
        }

        if ($dto->getAddPostUuids() !== null) {
            $postsToAdd = $postRepository->getByUuidsAndUser($dto->getAddPostUuids(), $user);

            foreach ($postsToAdd as $post) {
                $post->setPostGroup($postGroup);
            }
        }

        if ($dto->getRemovePostUuids() !== null) {
            $postsToRemove = $postRepository->getByUuidsAndUser($dto->getRemovePostUuids(), $user);

            foreach ($postsToRemove as $post) {
                $post->setPostGroup(null);
            }
        }

        $postGroupRepository->save($postGroup, true);

        return $this->json(
            data: $postGroup,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_groups_update']]
        );
    }

    #[Route('/{postGroupUuid}', name: 'api_post_groups_delete', methods: ['DELETE'])]
    public function delete(
        string $postGroupUuid,
        PostGroupRepository $postGroupRepository,
        PostRepository $postRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $postGroup = $postGroupRepository->getByUuidAndUser($postGroupUuid, $user);

        if ($postGroup === null) {
            return $this->json(data: ["message" => "You don't have any post group with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $postRepository->unlinkPostsByPostGroup($postGroup);
        $postGroupRepository->remove($postGroup, true);

        return $this->json(data: ["message" => "Post group deleted successfully"], status: Response::HTTP_OK);
    }
}
