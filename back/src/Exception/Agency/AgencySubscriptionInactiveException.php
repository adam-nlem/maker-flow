<?php

namespace App\Exception\Agency;

use Symfony\Component\HttpFoundation\Response;

final class AgencySubscriptionInactiveException extends AgencyException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'The agency\'s subscription is not active.',
            self::CODE,
            Response::HTTP_FORBIDDEN,
        );
    }
}
