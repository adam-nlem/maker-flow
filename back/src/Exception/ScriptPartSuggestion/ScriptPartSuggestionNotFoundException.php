<?php

namespace App\Exception\ScriptPartSuggestion;

use Symfony\Component\HttpFoundation\Response;

final class ScriptPartSuggestionNotFoundException extends ScriptPartSuggestionException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Script part suggestion not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
