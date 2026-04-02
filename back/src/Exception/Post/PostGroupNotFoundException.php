<?php

namespace App\Exception\Post;

use Symfony\Component\HttpFoundation\Response;

final class PostGroupNotFoundException extends PostException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'Post group not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
