<?php

namespace App\Service\Post;

use App\Entity\Enum\Platform;
use App\Entity\Integration;
use App\Entity\Project;
use App\Entity\User;
use App\DTO\External\Instagram\InstagramPostDTO;
use App\DTO\External\Youtube\YoutubePostDTO;
use App\DTO\Response\Post\PostWithAggregatedInsightsResponseDTO;
use App\DTO\Response\Post\PostWithPlatformAndInsightsResponseDTO;
use App\Entity\Enum\PostInsightType;
use App\Entity\Post;
use App\Helper\InsightHelper;
use App\Repository\PostInsightRepository;
use App\Repository\PostRepository;
use App\Service\PostGroup\PostGroupService;
class PostService
{
    public function __construct(
        private readonly PostRepository $repository,
        private readonly PostInsightRepository $insightRepository,
        private readonly PostGroupService $postGroupService,
        private readonly PostThumbnailService $postThumbnailService,
    ) {}

    public function createOrGetPost(
        Integration $integration,
        InstagramPostDTO $postDTO
    ): Post {
        $existingPost = $this->repository->getByExternalIdAndIntegration($postDTO->getExternalId(), $integration);

        if ($existingPost !== null) {
            if ($existingPost->getCaption() !== $postDTO->getCaption()) {
                $existingPost->setCaption($postDTO->getCaption());
                $this->repository->save($existingPost);
            }

            return $existingPost;
        }

        $post = new Post();
        $post
            ->setExternalId($postDTO->getExternalId())
            ->setMediaType($postDTO->getMediaType())
            ->setPublishedAt($postDTO->getPublishedAt())
            ->setDuration(0)
            ->setCaption($postDTO->getCaption())
            ->setExternalUrl($postDTO->getExternalUrl())
            ->setIntegration($integration)
            ->setUser($integration->getUser());

        if ($postDTO->getThumbnailUrl() !== null) {
            $this->postThumbnailService->downloadAndStore($post, $postDTO->getThumbnailUrl());
        }

        $this->repository->save($post);
        $this->postGroupService->tryAutoGroup($post);

        return $post;
    }

    public function createOrGetYoutubePost(
        Integration $integration,
        YoutubePostDTO $postDTO
    ): Post {
        $existingPost = $this->repository->getByExternalIdAndIntegration($postDTO->getExternalId(), $integration);

        if ($existingPost !== null) {
            if ($existingPost->getCaption() !== $postDTO->getCaption()) {
                $existingPost->setCaption($postDTO->getCaption());
                $this->repository->save($existingPost);
            }

            return $existingPost;
        }

        $post = new Post();
        $post
            ->setExternalId($postDTO->getExternalId())
            ->setMediaType($postDTO->getMediaType())
            ->setPublishedAt($postDTO->getPublishedAt())
            ->setDuration($postDTO->getDuration())
            ->setCaption($postDTO->getCaption())
            ->setExternalUrl($postDTO->getExternalUrl())
            ->setIntegration($integration)
            ->setUser($integration->getUser());

        if ($postDTO->getThumbnailUrl() !== null) {
            $this->postThumbnailService->downloadAndStore($post, $postDTO->getThumbnailUrl());
        }

        $this->repository->save($post);
        $this->postGroupService->tryAutoGroup($post);

        return $post;
    }

    /**
     * @return PostWithAggregatedInsightsResponseDTO[]
     */
    public function getRankedPosts(
        User $user,
        Integration $integration,
        int $page,
        int $limit,
    ): array {
        $postIds = $this->repository->getRankedIdsByUserAndIntegrationSortedByInsightValue(
            $user,
            $integration,
            PostInsightType::Views,
            $page,
            $limit,
        );

        if (empty($postIds)) {
            return [];
        }

        $posts = $this->repository->getByIds($postIds);

        $idOrder = array_flip($postIds);
        usort($posts, fn(Post $a, Post $b) => ($idOrder[$a->getId()] ?? 0) <=> ($idOrder[$b->getId()] ?? 0));

        $insightsByPostId = [];
        foreach ($this->insightRepository->getAggregatedLatestByPostIds($postIds) as $row) {
            $type = $row['type'] instanceof PostInsightType ? $row['type']->value : $row['type'];
            $insightsByPostId[$row['postId']][] = ['type' => $type, 'value' => (float) $row['value']];
        }

        return array_map(fn(Post $p) => new PostWithAggregatedInsightsResponseDTO(
            post: $p,
            aggregatedInsights: $insightsByPostId[$p->getId()] ?? [],
        ), $posts);
    }

    /**
     * @return PostWithPlatformAndInsightsResponseDTO[]
     */
    public function getPostsWithAggregatedInsightsByProject(
        User $user,
        Project $project,
        ?Platform $platform,
        int $page,
        int $limit,
    ): array {
        $posts = $this->repository->getByProjectAndUserPaginated($project, $user, $platform, $page, $limit);

        if (empty($posts)) {
            return [];
        }

        $postIds = array_map(fn(Post $p) => $p->getId(), $posts);

        $insightsByPostId = [];
        foreach ($this->insightRepository->getAggregatedLatestByPostIds($postIds) as $row) {
            $type = $row['type'] instanceof PostInsightType ? $row['type']->value : $row['type'];
            $insightsByPostId[$row['postId']][] = ['type' => $type, 'value' => (float) $row['value']];
        }

        return array_map(function (Post $p) use ($insightsByPostId) {
            $insights = $insightsByPostId[$p->getId()] ?? [];
            $views = $this->findAggregatedInsightValue($insights, PostInsightType::Views->value);
            $totalInteractions = $this->findAggregatedInsightValue($insights, PostInsightType::TotalInteractions->value);

            return new PostWithPlatformAndInsightsResponseDTO(
                post: $p,
                platform: $p->getIntegration()->getPlatform()->value,
                aggregatedInsights: $insights,
                postGroupUuid: $p->getPostGroup()?->getUuid(),
                postGroupTitle: $p->getPostGroup()?->getTitle(),
                engagementByViews: InsightHelper::calculateEngagement($totalInteractions, $views),
            );
        }, $posts);
    }

    /**
     * @param array<array{type: string, value: float}> $insights
     */
    private function findAggregatedInsightValue(array $insights, string $type): ?float
    {
        foreach ($insights as $insight) {
            if ($insight['type'] === $type) {
                return $insight['value'];
            }
        }

        return null;
    }
}
