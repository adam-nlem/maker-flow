<?php

namespace App\Exception\Script;

use Symfony\Component\HttpFoundation\Response;

final class ScriptNotFoundException extends ScriptException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Script not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
