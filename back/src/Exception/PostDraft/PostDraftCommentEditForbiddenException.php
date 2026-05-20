<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftCommentEditForbiddenException extends PostDraftException
{
    public const CODE = 19;

    public function __construct()
    {
        parent::__construct(
            'Only the comment author can edit its content.',
            self::CODE,
            Response::HTTP_FORBIDDEN,
        );
    }
}
