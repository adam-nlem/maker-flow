<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewCommentStatusOnReplyForbiddenException extends ReviewException
{
    public const CODE = 18;

    public function __construct()
    {
        parent::__construct(
            'Only top-level comments can have their status changed.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
