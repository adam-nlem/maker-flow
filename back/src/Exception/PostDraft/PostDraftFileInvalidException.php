<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class PostDraftFileInvalidException extends PostDraftException
{
    public const CODE = 1;

    public function __construct(array $meta = [])
    {
        parent::__construct(
            'The provided post draft file(s) are invalid.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
            $meta,
        );
    }
}
