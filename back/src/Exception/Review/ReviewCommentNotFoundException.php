<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewCommentNotFoundException extends ReviewException
{
    public const CODE = 16;

    public function __construct()
    {
        parent::__construct(
            'The comment does not exist.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
