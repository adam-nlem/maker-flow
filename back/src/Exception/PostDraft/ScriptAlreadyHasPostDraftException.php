<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class ScriptAlreadyHasPostDraftException extends PostDraftException
{
    public const CODE = 3;

    public function __construct(array $meta = [])
    {
        parent::__construct(
            'The selected script already has a post draft.',
            self::CODE,
            Response::HTTP_CONFLICT,
            $meta,
        );
    }
}
