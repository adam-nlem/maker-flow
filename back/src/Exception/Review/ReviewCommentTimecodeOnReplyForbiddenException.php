<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewCommentTimecodeOnReplyForbiddenException extends ReviewException
{
    public const CODE = 20;

    public function __construct()
    {
        parent::__construct(
            'Only top-level comments can carry a video timecode.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
