<?php

namespace App\DTO\Response\Review;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\ReviewComment;
use Symfony\Component\Serializer\Attribute\Groups;

class ListReviewCommentsGroupedByReviewResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups([
            'api_review_comments_pending'
        ])]
        private readonly ReviewWithLatestVersionResponseDTO $review,
        /** @var ReviewComment[] $comments */
        #[Groups([
            'api_review_comments_pending'
        ])]
        private readonly array $comments,
    ) {}

    public function getData(): array
    {
        return [
            'review' => $this->review,
            'comments' => $this->comments,
        ];
    }

    public function getReview(): ReviewWithLatestVersionResponseDTO
    {
        return $this->review;
    }

    /**
     * @return ReviewComment[]
     */
    public function getComments(): array
    {
        return $this->comments;
    }
}
