<?php

namespace App\Exception\Project;

use Symfony\Component\HttpFoundation\Response;

final class ProjectNameConflictException extends ProjectException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'You already have a project with this name.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
