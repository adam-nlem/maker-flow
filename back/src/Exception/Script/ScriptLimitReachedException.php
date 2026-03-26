<?php

namespace App\Exception\Script;

use Symfony\Component\HttpFoundation\Response;

final class ScriptLimitReachedException extends ScriptException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'Script limit reached for this plan.',
            self::CODE,
            Response::HTTP_PAYMENT_REQUIRED,
        );
    }
}
