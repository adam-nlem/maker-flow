<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewVersionNotPendingOrApprovedException extends ReviewException
{
    public const CODE = 9;

    public function __construct()
    {
        parent::__construct(
            'This action requires the review version to be pending or approved.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
