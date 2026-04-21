<?php

namespace App\Exception\Chat;

use Symfony\Component\HttpFoundation\Response;

final class ChatNotFoundException extends ChatException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Chat not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
