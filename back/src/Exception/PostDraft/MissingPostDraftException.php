<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class MissingPostDraftException extends PostDraftException
{
    public const CODE = 2;

    public function __construct(array $meta = [])
    {
        parent::__construct(
            'The requested post draft does not exist.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
            $meta,
        );
    }
}
