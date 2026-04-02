<?php

namespace App\Exception\Script;

use Symfony\Component\HttpFoundation\Response;

final class ScriptGenerationDeletionNotAllowedException extends ScriptException
{
    public const CODE = 8;

    public function __construct()
    {
        parent::__construct(
            'Cannot delete an active script generation.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
