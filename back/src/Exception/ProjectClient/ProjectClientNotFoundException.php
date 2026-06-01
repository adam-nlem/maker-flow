<?php

namespace App\Exception\ProjectClient;

use Symfony\Component\HttpFoundation\Response;

final class ProjectClientNotFoundException extends ProjectClientException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'No such client in this project.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
