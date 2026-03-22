<?php

namespace App\Exception\Project;

use Symfony\Component\HttpFoundation\Response;

final class ProjectAlreadyOpenException extends ProjectException
{
    public const CODE = 5;

    public function __construct()
    {
        parent::__construct(
            'This project is already open.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
