<?php

namespace App\Service\Integration\Exception;

use Symfony\Component\Uid\Uuid;

class OAuthTokenRevokedException extends IntegrationServiceException
{
    public const CODE = 1;

    public function __construct(private int $integrationId)
    {
        parent::__construct(
            sprintf('OAuth token revoked for integration "%s". The user needs to re-authenticate.', $integrationId),
            self::CODE
        );
    }

    public function getIntegrationId(): int
    {
        return $this->integrationId;
    }
}
