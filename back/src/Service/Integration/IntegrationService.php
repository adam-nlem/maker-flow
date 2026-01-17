<?php

namespace App\Service\Integration;

use App\Service\Integration\Exception\IconNotFoundException;
use Symfony\Component\HttpFoundation\File\File;

class IntegrationService
{
    public function __construct(
        private readonly string $integrationProviderIconPath,
    ) {}

    public function getIntegrationProviderIcon(string $provider): File
    {
        $filePath = sprintf('%s/%s.svg', $this->integrationProviderIconPath, $provider);
        if (!file_exists($filePath)) {
            $filePath = sprintf('%s/placeholder.svg', $this->integrationProviderIconPath);
        }
        return new File($filePath, false);
    }
}
