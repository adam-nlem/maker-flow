<?php

namespace App\Exception\HookTemplate;

use Symfony\Component\HttpFoundation\Response;

final class HookTemplateModificationForbiddenException extends HookTemplateException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'Only the original creator or an agency admin can modify this hook template.',
            self::CODE,
            Response::HTTP_FORBIDDEN,
        );
    }
}
