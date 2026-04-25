<?php

namespace App\Exception\ScriptPart;

use Symfony\Component\HttpFoundation\Response;

final class ScriptPartNotFoundException extends ScriptPartException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Script part not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
