<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Integration;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramPostDTO;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramPostInsightDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostInsight;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightRepository;

class InstagramPostInsightService
{
    public function __construct(
        private readonly SocialAnalyticsPostService $postService,
        private readonly SocialAnalyticsPostInsightRepository $postInsightRepository,
    ) {}

    public function processPostData(Integration $integration, array $postData): void
    {
        $postDTO = InstagramPostDTO::fromArray($postData);

        $post = $this->postService->createOrGetPost(
            $integration,
            $postDTO
        );

        $this->createPostInsights(post: $post, postInsightDTOs: $postDTO->getPostInsights());
    }

    /**
     * @param InstagramPostInsightDTO[] $postInsightDTOs
     */
    private function createPostInsights(SocialAnalyticsPost $post, array $postInsightDTOs): void
    {
        foreach ($postInsightDTOs as $postInsightDTO) {
            if ($postInsightDTO->getType() === null) {
                continue;
            }

            if ($this->shouldCreateInsight(post: $post, type: $postInsightDTO->getType(), value: $postInsightDTO->getValue())) {
                $value = $postInsightDTO->getValue();

                // Instagram returns watch time in milliseconds, convert to seconds
                if ($postInsightDTO->getType() === SocialAnalyticsPostInsightType::AverageWatchTime || $postInsightDTO->getType() === SocialAnalyticsPostInsightType::TotalWatchTime) {
                    $value = (int) ($value / 1000);
                }

                $insight = new SocialAnalyticsPostInsight();
                $insight
                    ->setType($postInsightDTO->getType())
                    ->setValue($value)
                    ->setSocialAnalyticsPost($post)
                    ->setUser($post->getUser());

                $this->postInsightRepository->save(entity: $insight);
            }
        }
    }

    private function shouldCreateInsight(SocialAnalyticsPost $post, ?SocialAnalyticsPostInsightType $type, int $value): bool
    {
        if ($type === null) {
            return false;
        }

        if ($post->getId() === null) {
            return true;
        }

        return $this->postInsightRepository->getLatestByPostAndByTypeAndByValue(
            post: $post,
            type: $type,
            value: $value
        ) === null;
    }
}
