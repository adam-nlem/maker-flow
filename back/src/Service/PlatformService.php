<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\File;

class PlatformService
{
    public function __construct(
        private readonly string $platformIconPath,
    ) {}

    public function getPlatformIcon(string $platform): File
    {
        $filePath = sprintf('%s/%s.svg', $this->platformIconPath, $platform);
        if (!file_exists($filePath)) {
            $filePath = sprintf('%s/placeholder.svg', $this->platformIconPath);
        }
        return new File($filePath, false);
    }
}
