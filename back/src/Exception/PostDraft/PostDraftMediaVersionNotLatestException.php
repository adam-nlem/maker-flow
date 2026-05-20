<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftMediaVersionNotLatestException extends PostDraftException
{
    public const CODE = 10;

    public function __construct()
    {
        parent::__construct(
            'This media version is no longer the latest one of its draft.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
