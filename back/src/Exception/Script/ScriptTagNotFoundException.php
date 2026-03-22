<?php

namespace App\Exception\Script;

use Symfony\Component\HttpFoundation\Response;

final class ScriptTagNotFoundException extends ScriptException
{
    public const CODE = 5;

    public function __construct()
    {
        parent::__construct(
            'Script tag not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
