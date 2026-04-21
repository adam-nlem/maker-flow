<?php

namespace App\Exception\ScriptVersion;

use Symfony\Component\HttpFoundation\Response;

final class ScriptVersionNotDraftException extends ScriptVersionException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'Script version status can only be updated when in draft.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
