<?php

namespace App\Exception\Project;

use Symfony\Component\HttpFoundation\Response;

final class ClientNotFoundException extends ProjectException
{
    public const CODE = 6;

    public function __construct()
    {
        parent::__construct(
            'No such client in this project.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
