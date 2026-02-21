<?php

namespace App\Controller;

use App\Entity\User;
use App\DTO\QueryParam\Post\ListPostsQueryParamDTO;
use App\Repository\PostRepository;
use App\Service\PostService;
use App\Entity\Enum\TimePeriod;
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
    public function __construct(private PostService $service) {}

    #[Route('', name: 'api_posts_list', methods: ['GET'])]
    public function list(
        ListPostsQueryParamDTO $queryParamDto,
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

        $posts = $this->service->getPostsWithInsights(
            user: $user,
            integration: $integration,
            page: $queryParamDto->getPage(),
            limit: $queryParamDto->getLimit(),
            timePeriod: TimePeriod::LastYear,
        );

        return $this->json(
            data: $posts,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_posts_list']],
        );
    }

    #[Route('/{postUuid}/thumbnail', name: 'api_posts_thumbnail', methods: ['GET'])]
    public function getThumbnail(
        string $postUuid,
        PostRepository $postRepository,
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

        $thumbnailFile = $this->service->getPostThumbnail($post);

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
