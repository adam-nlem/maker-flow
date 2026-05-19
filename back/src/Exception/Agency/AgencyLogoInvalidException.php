<?php

namespace App\Exception\Agency;

use App\Entity\Enum\FileInvalidReason;
use Symfony\Component\HttpFoundation\Response;

final class AgencyLogoInvalidException extends AgencyException
{
    public const CODE = 4;

    public function __construct(FileInvalidReason $reason)
    {
        parent::__construct(
            'The provided agency logo is invalid.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
            ['reason' => $reason->value],
        );
    }
}
