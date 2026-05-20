<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftMediaVersionNotAwaitingReviewOrApprovedException extends PostDraftException
{
    public const CODE = 9;

    public function __construct()
    {
        parent::__construct(
            'This action requires the media version to be awaiting review or approved.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
