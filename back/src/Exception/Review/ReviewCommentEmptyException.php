<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewCommentEmptyException extends ReviewException
{
    public const CODE = 11;

    public function __construct()
    {
        parent::__construct(
            'The comment cannot be empty.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
        );
    }
}
