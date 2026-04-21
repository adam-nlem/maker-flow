<?php

namespace App\Exception\TargetAudience;

use Symfony\Component\HttpFoundation\Response;

final class TargetAudienceNotFoundException extends TargetAudienceException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Target audience not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
