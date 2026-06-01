<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewCommentStatusInvalidException extends ReviewException
{
    public const CODE = 17;

    public function __construct()
    {
        parent::__construct(
            'The provided comment status is invalid.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
        );
    }
}
