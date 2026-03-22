<?php

namespace App\Exception\Script;

use Symfony\Component\HttpFoundation\Response;

final class ScriptTagTitleConflictException extends ScriptException
{
    public const CODE = 6;

    public function __construct()
    {
        parent::__construct(
            'You already have a script tag with this title.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
