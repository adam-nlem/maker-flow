<?php

namespace App\Exception\ScriptVersion;

use Symfony\Component\HttpFoundation\Response;

final class ScriptVersionNotFoundException extends ScriptVersionException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Script version not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
