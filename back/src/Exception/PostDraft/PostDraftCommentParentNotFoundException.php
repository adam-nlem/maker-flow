<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftCommentParentNotFoundException extends PostDraftException
{
    public const CODE = 14;

    public function __construct()
    {
        parent::__construct(
            'The parent comment does not exist or does not belong to this media version.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
