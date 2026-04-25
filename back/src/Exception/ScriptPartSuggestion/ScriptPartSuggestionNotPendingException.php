<?php

namespace App\Exception\ScriptPartSuggestion;

use Symfony\Component\HttpFoundation\Response;

final class ScriptPartSuggestionNotPendingException extends ScriptPartSuggestionException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'Script part suggestion is no longer pending.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
