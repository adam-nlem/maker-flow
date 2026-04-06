<?php

namespace App\Controller;

use App\Entity\User;
use App\DTO\QueryParam\Post\ListPostsQueryParamDTO;
use App\DTO\QueryParam\Post\RankPostsQueryParamDTO;
use App\DTO\QueryParam\Post\SearchPostsQueryParamDTO;
use App\Exception\Integration\IntegrationNotFoundException;
use App\Exception\Post\PostNotFoundException;
use App\Exception\Post\PostThumbnailNotFoundException;
use App\Exception\Project\ProjectNotFoundException;
use App\Repository\PostRepository;
use App\Repository\ProjectRepository;
use App\Service\Post\PostService;
use App\Service\Post\PostThumbnailService;
use App\Repository\IntegrationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/posts', requirements: ['postUuid' => Requirement::UUID])]
final class PostController extends AbstractController
{
    public function __construct(private PostService $postService) {}

    #[Route('', name: 'api_posts_list', methods: ['GET'])]
    public function list(
        ListPostsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $posts = $this->postService->getPostsWithAggregatedInsightsByProjectAndSearchTerm(
            user: $user,
            project: $project,
            platform: $queryParamDto->getPlatform(),
            searchTerm: $queryParamDto->getSearchTerm(),
            page: $queryParamDto->getPage(),
            limit: $queryParamDto->getLimit(),
        );

        return $this->json(
            data: $posts,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_posts_list']],
        );
    }

    #[Route('/rank', name: 'api_posts_rank', methods: ['GET'])]
    public function rank(
        RankPostsQueryParamDTO $queryParamDto,
        IntegrationRepository $integrationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $integrationRepository->getByUuidAndUser($queryParamDto->getIntegrationUuid(), $user);

        if ($integration === null) {
            throw new IntegrationNotFoundException();
        }

        $posts = $this->postService->getRankedPosts(
            user: $user,
            integration: $integration,
            page: $queryParamDto->getPage(),
            limit: $queryParamDto->getLimit(),
        );

        return $this->json(
            data: $posts,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_posts_rank']],
        );
    }

    #[Route('/search', name: 'api_posts_search', methods: ['GET'])]
    public function search(
        SearchPostsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
        PostRepository $postRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $posts = $postRepository->searchByProjectAndUserAndCaption(
            $project,
            $user,
            $queryParamDto->getPlatform(),
            $queryParamDto->getSearch(),
            $queryParamDto->getLimit(),
        );

        return $this->json(
            data: array_map(fn($post) => [
                'uuid' => $post->getUuid(),
                'caption' => $post->getCaption(),
                'publishedAt' => $post->getPublishedAt(),
                'mediaType' => $post->getMediaType()->value,
                'platform' => $post->getIntegration()->getPlatform()->value,
                'postGroupUuid' => $post->getPostGroup()?->getUuid(),
            ], $posts),
            status: Response::HTTP_OK,
        );
    }

    #[Route('/{postUuid}/thumbnail', name: 'api_posts_thumbnail', methods: ['GET'])]
    public function getThumbnail(
        string $postUuid,
        PostRepository $postRepository,
        PostThumbnailService $postThumbnailService,
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        $post = $postRepository->getByUuidAndUser($postUuid, $user);

        if ($post === null) {
            throw new PostNotFoundException();
        }

        $thumbnailFile = $postThumbnailService->getFile($post);

        if ($thumbnailFile === null) {
            throw new PostThumbnailNotFoundException();
        }

        return new BinaryFileResponse(
            $thumbnailFile,
            Response::HTTP_OK,
            ['Content-Type' => $thumbnailFile->getMimeType()],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE
        );
    }
}
