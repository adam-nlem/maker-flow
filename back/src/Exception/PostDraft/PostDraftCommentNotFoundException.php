<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftCommentNotFoundException extends PostDraftException
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
