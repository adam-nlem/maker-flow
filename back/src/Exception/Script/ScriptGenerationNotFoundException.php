<?php

namespace App\Exception\Script;

use Symfony\Component\HttpFoundation\Response;

final class ScriptGenerationNotFoundException extends ScriptException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'Script generation not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
