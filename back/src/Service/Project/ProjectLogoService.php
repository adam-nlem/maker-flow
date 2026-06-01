<?php

namespace App\Service\Project;

use App\Entity\Enum\FileInvalidReason;
use App\Entity\Project;
use App\Exception\Project\ProjectLogoInvalidException;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ProjectLogoService
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
            throw new ProjectLogoInvalidException(FileInvalidReason::FileTooLarge);
        }

        if ($file->getMimeType() !== self::ALLOWED_MIME_TYPE) {
            throw new ProjectLogoInvalidException(FileInvalidReason::InvalidMimeType);
        }
    }

    public function save(Project $project, UploadedFile $file): string
    {
        $directory = $this->getDirectory($project);

        if (!$this->filesystem->exists($directory)) {
            $this->filesystem->mkdir($directory);
        }

        $file->move($directory, $this->getFilename($project));

        return sprintf('%s/%s', $this->getDirectory($project), $this->getFilename($project));
    }

    public function getFile(Project $project): ?File
    {
        $path = sprintf('%s/%s', $this->getDirectory($project), $this->getFilename($project));

        if (!file_exists($path)) {
            return null;
        }

        return new File($path, false);
    }

    private function getDirectory(Project $project): string
    {
        return sprintf(
            '%s/%s/project/%s/logo',
            $this->agencyUploadsRoot,
            $project->getAgency()->getUuid(),
            $project->getUuid()
        );
    }

    private function getFilename(Project $project): string
    {
        return sprintf('%s.%s', $project->getUuid(), self::EXTENSION);
    }
}
