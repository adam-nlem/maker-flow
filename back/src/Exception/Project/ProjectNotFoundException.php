<?php

namespace App\Exception\Project;

use Symfony\Component\HttpFoundation\Response;

final class ProjectNotFoundException extends ProjectException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Project not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
