<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftMediaVersionNotAwaitingReviewException extends PostDraftException
{
    public const CODE = 8;

    public function __construct()
    {
        parent::__construct(
            'This action requires the media version to be awaiting review.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
