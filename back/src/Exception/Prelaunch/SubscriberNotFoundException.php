<?php

namespace App\Exception\Prelaunch;

use Symfony\Component\HttpFoundation\Response;

final class SubscriberNotFoundException extends PrelaunchException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'Subscriber not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND
        );
    }
}
