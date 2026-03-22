<?php

namespace App\Exception\Project;

use Symfony\Component\HttpFoundation\Response;

final class ProjectAlreadyFinishedException extends ProjectException
{
    public const CODE = 4;

    public function __construct()
    {
        parent::__construct(
            'This project has already been finished.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
