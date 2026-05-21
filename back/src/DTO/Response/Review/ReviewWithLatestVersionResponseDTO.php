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
            'api_review_versions_request_changes',
            'api_review_comments_create',
            'api_review_comments_update',
        ])]
        private readonly Review $review,
        #[Groups([
            'api_reviews_list',
            'api_reviews_show',
            'api_reviews_create',
            'api_reviews_update',
            'api_review_versions_approve',
            'api_review_versions_request_changes',
            'api_review_comments_create',
            'api_review_comments_update',
        ])]
        private readonly ?ReviewVersion $latestVersion,
    ) {}

    public static function fromEntity(Review $review): self
    {
        return new self(
            review: $review,
            latestVersion: $review->getLatestVersion(),
        );
    }

    public function getData(): array
    {
        return [
            'review' => $this->review,
            'latestVersion' => $this->latestVersion,
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
}
