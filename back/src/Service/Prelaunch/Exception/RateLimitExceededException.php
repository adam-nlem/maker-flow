<?php

namespace App\Service\Prelaunch\Exception;

class RateLimitExceededException extends PrelaunchServiceException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct('Too many registrations from this IP address.', self::CODE);
    }
}
