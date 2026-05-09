<?php

namespace App\Exception\HookTemplate;

use Symfony\Component\HttpFoundation\Response;

final class HookTemplateNotFoundException extends HookTemplateException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Hook template not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
