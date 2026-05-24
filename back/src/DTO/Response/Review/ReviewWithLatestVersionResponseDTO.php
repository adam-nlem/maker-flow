<?php

namespace App\DTO\Response\Review;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\Review;
use App\Entity\ReviewVersion;
use Symfony\Component\Serializer\Attribute\Groups;

class ReviewWithLatestVersionResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups([
            'api_reviews_list',
            'api_reviews_show',
            'api_reviews_create',
            'api_reviews_update',
            'api_review_versions_approve',
            'api_review_versions_create',
            'api_review_comments_create',
            'api_review_comments_update',
            'api_review_comments_pending',
        ])]
        private readonly Review $review,
        #[Groups([
            'api_reviews_list',
            'api_reviews_show',
            'api_reviews_create',
            'api_reviews_update',
            'api_review_versions_approve',
            'api_review_versions_create',
            'api_review_comments_create',
            'api_review_comments_update',
            'api_review_comments_pending',
        ])]
        private readonly ?ReviewVersion $latestVersion,
        #[Groups([
            'api_reviews_list',
            'api_reviews_show',
            'api_reviews_create',
            'api_reviews_update',
            'api_review_versions_approve',
            'api_review_versions_create',
            'api_review_comments_create',
            'api_review_comments_update',
            'api_review_comments_pending',
        ])]
        private readonly ?int $unresolvedCommentsCount,
    ) {}

    public static function fromEntity(Review $review, ?int $unresolvedCommentsCount = null): self
    {
        return new self(
            review: $review,
            latestVersion: $review->getLatestVersion(),
            unresolvedCommentsCount: $unresolvedCommentsCount,
        );
    }

    public function getData(): array
    {
        return [
            'review' => $this->review,
            'latestVersion' => $this->latestVersion,
            'unresolvedCommentsCount' => $this->unresolvedCommentsCount,
        ];
    }

    public function getReview(): Review
    {
        return $this->review;
    }

    public function getLatestVersion(): ?ReviewVersion
    {
        return $this->latestVersion;
    }

    public function getUnresolvedCommentsCount(): ?int
    {
        return $this->unresolvedCommentsCount;
    }
}
