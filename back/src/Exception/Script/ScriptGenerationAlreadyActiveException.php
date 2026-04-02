<?php

namespace App\Exception\Script;

use Symfony\Component\HttpFoundation\Response;

final class ScriptGenerationAlreadyActiveException extends ScriptException
{
    public const CODE = 7;

    public function __construct()
    {
        parent::__construct(
            'A script generation is already being processed.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
