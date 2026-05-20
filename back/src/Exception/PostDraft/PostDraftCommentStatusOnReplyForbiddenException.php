<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftCommentStatusOnReplyForbiddenException extends PostDraftException
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
