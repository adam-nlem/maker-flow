<?php

namespace App\Exception\Review;

use App\Entity\Enum\FileInvalidReason;
use Symfony\Component\HttpFoundation\Response;

final class ReviewFileInvalidException extends ReviewException
{
    public const CODE = 1;

    public function __construct(FileInvalidReason $reason)
    {
        parent::__construct(
            'The provided review file(s) are invalid.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
            ['reason' => $reason->value],
        );
    }
}
