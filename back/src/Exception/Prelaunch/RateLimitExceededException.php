<?php

namespace App\Exception\Prelaunch;

use Symfony\Component\HttpFoundation\Response;

final class RateLimitExceededException extends PrelaunchException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Too many registrations from this IP address.',
            self::CODE,
            Response::HTTP_TOO_MANY_REQUESTS
        );
    }
}
