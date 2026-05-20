<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftCommentStatusInvalidException extends PostDraftException
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
