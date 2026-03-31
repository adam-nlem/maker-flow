<?php

namespace App\Controller;

use App\Entity\User;
use App\DTO\QueryParam\Post\ListPostsQueryParamDTO;
use App\DTO\QueryParam\Post\RankPostsQueryParamDTO;
use App\Repository\PostRepository;
use App\Service\Post\PostService;
use App\Service\Post\PostThumbnailService;
use App\Entity\Enum\TimePeriod;
use App\Repository\IntegrationRepository;
use App\Repository\SubscriptionRepository;
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
        IntegrationRepository $integrationRepository,
        SubscriptionRepository $subscriptionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $integrationRepository->getByUuidAndUser($queryParamDto->getIntegrationUuid(), $user);

        if ($integration === null) {
            return $this->json(
                data: ["message" => "You don't have any integration with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        $isSubscribed = $subscriptionRepository->getLatestActiveByUser($user) !== null;

        $posts = $this->postService->getPostsWithInsights(
            user: $user,
            integration: $integration,
            page: $queryParamDto->getPage(),
            limit: $queryParamDto->getLimit(),
            timePeriod: TimePeriod::LastYear,
            isSubscribed: $isSubscribed,
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
            return $this->json(
                data: ["message" => "You don't have any integration with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
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
            return $this->json(
                data: ["message" => "You don't have any post with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        $thumbnailFile = $postThumbnailService->getFile($post);

        if ($thumbnailFile === null) {
            return $this->json(
                data: ["message" => "Thumbnail not found for this post"],
                status: Response::HTTP_NOT_FOUND
            );
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
