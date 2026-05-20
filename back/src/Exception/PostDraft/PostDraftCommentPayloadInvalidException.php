<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftCommentPayloadInvalidException extends PostDraftException
{
    public const CODE = 13;

    public function __construct()
    {
        parent::__construct(
            'The comment payload is invalid.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
        );
    }
}
