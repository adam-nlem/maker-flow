<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewCommentParentNotFoundException extends ReviewException
{
    public const CODE = 14;

    public function __construct()
    {
        parent::__construct(
            'The parent comment does not exist or does not belong to this review version.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
