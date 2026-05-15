<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftLockedException extends PostDraftException
{
    public const CODE = 4;

    public function __construct(array $meta = [])
    {
        parent::__construct(
            'This post draft cannot be modified in its current status.',
            self::CODE,
            Response::HTTP_CONFLICT,
            $meta,
        );
    }
}
