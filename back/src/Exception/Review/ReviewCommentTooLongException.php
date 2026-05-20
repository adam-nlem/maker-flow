<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewCommentTooLongException extends ReviewException
{
    public const CODE = 12;

    public function __construct()
    {
        parent::__construct(
            'The comment exceeds the maximum length.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
        );
    }
}
