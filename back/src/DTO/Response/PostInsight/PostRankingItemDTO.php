<?php

namespace App\DTO\Response\PostInsight;

use App\Entity\Post;
use Symfony\Component\Serializer\Attribute\Groups;

class PostRankingItemDTO
{
    public function __construct(
        #[Groups(['api_post_insights_detail'])]
        private readonly Post $post,
        #[Groups(['api_post_insights_detail'])]
        private readonly float $score,
    ) {}

    public function getPost(): Post
    {
        return $this->post;
    }

    public function getScore(): float
    {
        return $this->score;
    }
}
