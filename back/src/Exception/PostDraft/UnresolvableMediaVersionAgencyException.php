<?php

namespace App\Exception\PostDraft;

use Symfony\Component\HttpFoundation\Response;

final class UnresolvableMediaVersionAgencyException extends PostDraftException
{
    public const CODE = 5;

    public function __construct(string $mediaVersionUuid)
    {
        parent::__construct(
            sprintf('Cannot resolve agency for media version %s.', $mediaVersionUuid),
            self::CODE,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            ['mediaVersionUuid' => $mediaVersionUuid],
        );
    }
}
