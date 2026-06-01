<?php

namespace App\Service\Agency;

use App\Entity\Agency;
use App\Entity\Enum\FileInvalidReason;
use App\Exception\Agency\AgencyLogoInvalidException;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class AgencyLogoService
{
    private const ALLOWED_MIME_TYPE = 'image/png';
    private const EXTENSION = 'png';
    private const MAX_FILE_SIZE = 5 * 1024 * 1024;

    public function __construct(
        private readonly Filesystem $filesystem,
        private readonly string $agencyUploadsRoot,
    ) {}

    public function validate(UploadedFile $file): void
    {
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new AgencyLogoInvalidException(FileInvalidReason::FileTooLarge);
        }

        if ($file->getMimeType() !== self::ALLOWED_MIME_TYPE) {
            throw new AgencyLogoInvalidException(FileInvalidReason::InvalidMimeType);
        }
    }

    public function save(Agency $agency, UploadedFile $file): string
    {
        $directory = $this->getDirectory($agency);

        if (!$this->filesystem->exists($directory)) {
            $this->filesystem->mkdir($directory);
        }

        $file->move($directory, $this->getFilename($agency));

        return sprintf('%s/%s', $this->getDirectory($agency), $this->getFilename($agency));
    }

    public function getFile(Agency $agency): ?File
    {
        $path = sprintf('%s/%s', $this->getDirectory($agency), $this->getFilename($agency));

        if (!file_exists($path)) {
            return null;
        }

        return new File($path, false);
    }

    private function getDirectory(Agency $agency): string
    {
        return sprintf('%s/%s/logo', $this->agencyUploadsRoot, $agency->getUuid());
    }

    private function getFilename(Agency $agency): string
    {
        return sprintf('%s.%s', $agency->getUuid(), self::EXTENSION);
    }
}
