<?php

namespace App\Controller;

use App\Entity\User;
use App\DTO\QueryParam\PostInsight\ShowPostInsightDetailQueryParamDTO;
use App\Repository\PostRepository;
use App\Service\PostInsight\PostInsightService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/post-insights')]
final class PostInsightController extends AbstractController
{

    #[Route('/detail', name: 'api_post_insights_detail', methods: ['GET'])]
    public function detail(
        ShowPostInsightDetailQueryParamDTO $queryParamDto,
        PostRepository $postRepository,
        PostInsightService $postInsightService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $post = $postRepository->getByUuidAndUser($queryParamDto->getPostUuid(), $user);

        if ($post === null) {
            return $this->json(
                data: ["message" => "Post not found"],
                status: Response::HTTP_NOT_FOUND,
            );
        }

        $detail = $postInsightService->getDetail($user, $post);

        return $this->json(
            data: $detail->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_post_insights_detail']],
        );
    }
}
