<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewCommentReplyCannotHaveTimecodeException extends ReviewException
{
    public const CODE = 15;

    public function __construct()
    {
        parent::__construct(
            'A reply cannot carry a video timecode.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
        );
    }
}
