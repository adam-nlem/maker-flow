<?php

namespace App\Service\TiktokPostInsight;

use App\Entity\Integration;
use App\Service\Post\PostService;
use App\DTO\External\Tiktok\TiktokPostDTO;
use App\DTO\External\Tiktok\TiktokPostInsightDTO;
use App\Entity\Enum\PostInsightType;
use App\Entity\Post;
use App\Entity\PostInsight;
use App\Repository\PostInsightRepository;

class TiktokPostInsightService
{
    public function __construct(
        private readonly PostService $postService,
        private readonly PostInsightRepository $postInsightRepository,
    ) {}

    public function processPostData(Integration $integration, array $videoData): void
    {
        $postDTO = TiktokPostDTO::fromArray($videoData);

        $post = $this->postService->createOrGetTiktokPost(
            $integration,
            $postDTO
        );

        $this->createPostInsights(post: $post, postInsightDTOs: $postDTO->getPostInsights());
    }

    /**
     * @param TiktokPostInsightDTO[] $postInsightDTOs
     */

    private function createPostInsights(Post $post, array $postInsightDTOs): void
    {
        foreach ($postInsightDTOs as $postInsightDTO) {
            if ($postInsightDTO->getType() === null) {
                continue;
            }

            if ($this->shouldCreateInsight(post: $post, type: $postInsightDTO->getType(), value: $postInsightDTO->getValue())) {
                $insight = new PostInsight();
                $insight
                    ->setType($postInsightDTO->getType())
                    ->setValue($postInsightDTO->getValue())
                    ->setValueFormat($postInsightDTO->getType()->getValueFormat())
                    ->setPost($post);

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
