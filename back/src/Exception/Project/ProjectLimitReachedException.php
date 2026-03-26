<?php

namespace App\Exception\Project;

use Symfony\Component\HttpFoundation\Response;

final class ProjectLimitReachedException extends ProjectException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'Project limit reached for this plan.',
            self::CODE,
            Response::HTTP_PAYMENT_REQUIRED,
        );
    }
}
