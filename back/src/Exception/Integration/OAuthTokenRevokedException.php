<?php

namespace App\Exception\Integration;

use Symfony\Component\HttpFoundation\Response;

final class OAuthTokenRevokedException extends IntegrationException
{
    public const CODE = 1;

    public function __construct(private readonly string $integrationUuid)
    {
        parent::__construct(
            sprintf('OAuth token revoked for integration (uuid: "%s"). The user needs to re-authenticate.', $integrationUuid),
            self::CODE,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            ['integrationUuid' => $integrationUuid],
        );
    }

    public function getIntegrationUuid(): string
    {
        return $this->integrationUuid;
    }
}
