<?php

namespace App\Exception\Post;

use Symfony\Component\HttpFoundation\Response;

final class PostThumbnailNotFoundException extends PostException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'Post thumbnail not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
