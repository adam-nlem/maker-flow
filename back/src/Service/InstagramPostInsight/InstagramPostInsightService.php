<?php

namespace App\Service\InstagramPostInsight;

use App\Entity\Integration;
use App\Service\Post\PostService;
use App\DTO\External\Instagram\InstagramPostDTO;
use App\DTO\External\Instagram\InstagramPostInsightDTO;
use App\Entity\Enum\PostInsightType;
use App\Entity\Post;
use App\Entity\PostInsight;
use App\Repository\PostInsightRepository;

class InstagramPostInsightService
{
    public function __construct(
        private readonly PostService $postService,
        private readonly PostInsightRepository $postInsightRepository,
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
    private function createPostInsights(Post $post, array $postInsightDTOs): void
    {
        foreach ($postInsightDTOs as $postInsightDTO) {
            if ($postInsightDTO->getType() === null) {
                continue;
            }

            if ($this->shouldCreateInsight(post: $post, type: $postInsightDTO->getType(), value: $postInsightDTO->getValue())) {
                $value = $postInsightDTO->getValue();

                // Instagram returns watch time in milliseconds, convert to seconds
                if ($postInsightDTO->getType() === PostInsightType::AverageWatchTime || $postInsightDTO->getType() === PostInsightType::TotalWatchTime) {
                    $value = $value / 1000;
                }

                $insight = new PostInsight();
                $insight
                    ->setType($postInsightDTO->getType())
                    ->setValue($value)
                    ->setValueFormat($postInsightDTO->getType()->getValueFormat())
                    ->setPost($post)
                    ->setUser($post->getUser());

                $this->postInsightRepository->save(entity: $insight);
            }
        }
    }

    private function shouldCreateInsight(Post $post, ?PostInsightType $type, float $value): bool
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
