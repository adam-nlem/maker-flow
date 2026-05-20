<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class MissingReviewException extends ReviewException
{
    public const CODE = 2;

    public function __construct(array $meta = [])
    {
        parent::__construct(
            'The requested review does not exist.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
            $meta,
        );
    }
}
