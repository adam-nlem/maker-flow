<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftCommentReplyCannotHaveTimecodeException extends PostDraftException
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
