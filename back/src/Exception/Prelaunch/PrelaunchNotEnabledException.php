<?php

namespace App\Exception\Prelaunch;

use Symfony\Component\HttpFoundation\Response;

final class PrelaunchNotEnabledException extends PrelaunchException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'Prelaunch is not enabled.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
