<?php

namespace App\Module\SocialAnalytics\Controller;

use App\Entity\User;
use App\Module\SocialAnalytics\DTO\QueryParam\PostInsight\ListSocialAnalyticsPostInsightQueryParamDTO;
use App\Module\SocialAnalytics\DTO\QueryParam\PostInsight\ShowSocialAnalyticsPostInsightDetailQueryParamDTO;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightRepository;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;
use App\Module\SocialAnalytics\Service\SocialAnalyticsPostInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/social-analytics/post-insights')]
class SocialAnalyticsPostInsightController extends AbstractController
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

    #[Route('', name: 'api_modules_social_analytics_post_insights_list', methods: ['GET'])]
    public function list(
        ListSocialAnalyticsPostInsightQueryParamDTO $queryParamDto,
        IntegrationRepository $integrationRepository,
        SocialAnalyticsPostInsightRepository $insightRepository,
    ) {
        

        // TODO: Implement list logic
    }

    #[Route('', name: 'api_modules_social_analytics_post_insights_create', methods: ['POST'])]
    public function create()
    {
        /** @var User $user */
        $user = $this->getUser();

        // TODO: Implement create logic
    }

    #[Route('/{postInsightUuid}', name: 'api_modules_social_analytics_post_insights_show', methods: ['GET'])]
    public function show(string $postInsightUuid)
    {
        /** @var User $user */
        $user = $this->getUser();

        // TODO: Implement show logic
    }

    #[Route('/{postInsightUuid}', name: 'api_modules_social_analytics_post_insights_update', methods: ['PATCH'])]
    public function update(string $postInsightUuid)
    {
        /** @var User $user */
        $user = $this->getUser();

        // TODO: Implement update logic
    }

    #[Route('/{postInsightUuid}', name: 'api_modules_social_analytics_post_insights_delete', methods: ['DELETE'])]
    public function delete(string $postInsightUuid)
    {
        /** @var User $user */
        $user = $this->getUser();

        // TODO: Implement delete logic
    }
}
