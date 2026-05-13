<?php

namespace App\Service\Agency;

use App\Entity\Agency;
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
        private readonly string $logoDirectory,
    ) {}

    /**
     * Stores an uploaded logo on disk, overwriting any existing one for this agency.
     */
    public function upload(Agency $agency, UploadedFile $file): string
    {
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new AgencyLogoInvalidException(['reason' => 'file_too_large']);
        }

        if ($file->getMimeType() !== self::ALLOWED_MIME_TYPE) {
            throw new AgencyLogoInvalidException(['reason' => 'invalid_mime_type']);
        }

        if (!$this->filesystem->exists($this->logoDirectory)) {
            $this->filesystem->mkdir($this->logoDirectory);
        }

        $file->move($this->logoDirectory, $this->getFilename($agency));

        return $this->getPath($agency);
    }

    /**
     * Returns the absolute path where this agency's logo lives on disk (whether or not the file exists).
     */
    public function getPath(Agency $agency): string
    {
        return sprintf('%s/%s', $this->logoDirectory, $this->getFilename($agency));
    }

    /**
     * Returns the agency logo as a File object, or null when none is stored.
     */
    public function getFile(Agency $agency): ?File
    {
        $path = $this->getPath($agency);

        if (!file_exists($path)) {
            return null;
        }

        return new File($path, false);
    }

    private function getFilename(Agency $agency): string
    {
        return sprintf('%s.%s', $agency->getUuid(), self::EXTENSION);
    }
}
