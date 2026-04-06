<?php

namespace App\Exception\Post;

use Symfony\Component\HttpFoundation\Response;

final class PostNotFoundException extends PostException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Post not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
