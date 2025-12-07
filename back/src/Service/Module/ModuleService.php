<?php

namespace App\Service\Module;

use App\Service\Module\Exception\IconNotFoundException;
use Symfony\Component\HttpFoundation\File\File;

class ModuleService
{
    public function __construct(
        private readonly string $moduleIconPath,
    ) {}

    public function getModuleIcon(string $moduleUuid): File
    {
        $filePath = sprintf('%s/%s.svg', $this->moduleIconPath, $moduleUuid);
        if (!file_exists($filePath)) {
            $filePath = sprintf('%s/placeholder.svg', $this->moduleIconPath);
        }
        return new File($filePath, false);
    }
}
