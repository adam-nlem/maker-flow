<?php

namespace App\Service\Module\Exception;

use Throwable;

class IconNotFoundException extends ModuleServiceException
{
    const CODE = 1;

    public function __construct(private string $moduleUuid, private string $filePath)
    {
        return parent::__construct(sprintf('The icon for the module "%s" could not be found at path "%s"', $moduleUuid, $filePath), self::CODE);
    }

    public function getModuleUuid(): string
    {
        return $this->moduleUuid;
    }

    public function getFilePath(): string
    {
        return $this->filePath;
    }
}
