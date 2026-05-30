<?php

namespace App\Exception\Project;

use App\Entity\Enum\FileInvalidReason;
use Symfony\Component\HttpFoundation\Response;

final class ProjectLogoInvalidException extends ProjectException
{
    public const CODE = 6;

    public function __construct(FileInvalidReason $reason)
    {
        parent::__construct(
            'The provided project logo is invalid.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
            ['reason' => $reason->value],
        );
    }
}
