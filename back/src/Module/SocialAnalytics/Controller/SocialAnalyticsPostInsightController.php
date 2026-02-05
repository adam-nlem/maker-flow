<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\DTO\QueryParam\PostInsight\ShowSocialAnalyticsPostInsightDetailQueryParamDTO;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;
use App\Module\SocialAnalytics\Service\SocialAnalyticsPostInsightService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/post-insights')]
final class SocialAnalyticsPostInsightController extends AbstractController
{

    #[Route('/detail', name: 'api_modules_social_analytics_post_insights_detail', methods: ['GET'])]
    public function detail(
        ShowSocialAnalyticsPostInsightDetailQueryParamDTO $queryParamDto,
        SocialAnalyticsPostRepository $postRepository,
        SocialAnalyticsPostInsightService $postInsightService,
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
            context: ['groups' => ['api_modules_social_analytics_post_insights_detail']],
        );
    }
}
