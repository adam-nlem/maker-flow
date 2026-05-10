<?php

namespace App\Controller;

use App\Entity\Enum\UserRole;
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
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/posts', requirements: ['postUuid' => Requirement::UUID])]
final class PostController extends AbstractController
{
    public function __construct(private PostService $postService) {}

    #[Route('', name: 'api_posts_list', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function list(
        ListPostsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $posts = $this->postService->getPostListItems(
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

    #[Route('/{postUuid}', name: 'api_posts_show', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function show(string $postUuid, PostRepository $postRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $post = $postRepository->getAccessibleByUuidForUser($postUuid, $user);

        if ($post === null) {
            throw new PostNotFoundException();
        }

        return $this->json(
            data: $this->postService->getPostDetail($post),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_posts_show']],
        );
    }

    #[Route('/rank', name: 'api_posts_rank', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function rank(
        RankPostsQueryParamDTO $queryParamDto,
        IntegrationRepository $integrationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $integrationRepository->getAccessibleByUuidForUser($queryParamDto->getIntegrationUuid(), $user);

        if ($integration === null) {
            throw new IntegrationNotFoundException();
        }

        $posts = $this->postService->getRankedPosts(
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

    #[Route('/{postUuid}/thumbnail', name: 'api_posts_thumbnail', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function getThumbnail(
        string $postUuid,
        PostRepository $postRepository,
        PostThumbnailService $postThumbnailService,
    ): Response {
        /** @var User $user */
        $user = $this->getUser();

        $post = $postRepository->getAccessibleByUuidForUser($postUuid, $user);

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
