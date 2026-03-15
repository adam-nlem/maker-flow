<?php

namespace App\Service\Prelaunch\Exception;

class SubscriberNotFoundException extends PrelaunchServiceException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct('Subscriber not found.', self::CODE);
    }
}
