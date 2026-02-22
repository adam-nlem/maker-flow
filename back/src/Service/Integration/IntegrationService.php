<?php

namespace App\Service\Integration;

use App\Service\Integration\Exception\IconNotFoundException;
use Symfony\Component\HttpFoundation\File\File;

class IntegrationService
{
    public function __construct(
        private readonly string $integrationPlatformIconPath,
    ) {}

    public function getIntegrationPlatformIcon(string $platform): File
    {
        $filePath = sprintf('%s/%s.svg', $this->integrationPlatformIconPath, $platform);
        if (!file_exists($filePath)) {
            $filePath = sprintf('%s/placeholder.svg', $this->integrationPlatformIconPath);
        }
        return new File($filePath, false);
    }
}
