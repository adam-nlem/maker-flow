<?php

namespace App\Service\PostDraft;

use App\Entity\Enum\FileInvalidReason;
use App\Entity\Enum\MediaType;
use App\Entity\PostDraftMediaVersion;
use App\Exception\PostDraft\PostDraftFileInvalidException;
use App\Exception\PostDraft\UnresolvableMediaVersionAgencyException;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class PostDraftFileService
{
    private const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
    private const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
    private const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/quicktime', 'video/webm'];
    private const ALLOWED_IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/webp'];
    private const CAROUSEL_MIN_FILES = 2;
    private const CAROUSEL_MAX_FILES = 10;

    public function __construct(
        private readonly Filesystem $filesystem,
        private readonly string $agencyUploadsRoot,
    ) {}

    public function getMediaVersionDirectory(PostDraftMediaVersion $mediaVersion): string
    {
        $agencyUuid = $mediaVersion->getPostDraft()?->getProject()?->getAgency()?->getUuid()
            ?? throw new UnresolvableMediaVersionAgencyException($mediaVersion->getUuid());

        return sprintf('%s/%s/post-drafts/%s', $this->agencyUploadsRoot, $agencyUuid, $mediaVersion->getUuid());
    }

    /**
     * @param UploadedFile[] $files
     */
    public function storeUploadedFiles(PostDraftMediaVersion $mediaVersion, array $files): void
    {
        $files = array_values($files);
        $mediaType = $mediaVersion->getPostDraft()->getMediaType();
        $this->validateFiles($files, $mediaType);

        $directory = $this->getMediaVersionDirectory($mediaVersion);

        if (!$this->filesystem->exists($directory)) {
            $this->filesystem->mkdir($directory);
        }

        foreach ($files as $index => $file) {
            $extension = $file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'bin';
            $filename = sprintf('%d.%s', $index + 1, strtolower($extension));
            $file->move($directory, $filename);
        }
    }

    public function getFileByIndex(PostDraftMediaVersion $mediaVersion, int $index): ?File
    {
        $directory = $this->getMediaVersionDirectory($mediaVersion);

        if (!$this->filesystem->exists($directory)) {
            return null;
        }

        $matches = glob(sprintf('%s/%d.*', $directory, $index)) ?: [];

        if ($matches === []) {
            return null;
        }

        return new File($matches[0], false);
    }

    public function deleteMediaVersion(PostDraftMediaVersion $mediaVersion): void
    {
        $directory = $this->getMediaVersionDirectory($mediaVersion);

        if ($this->filesystem->exists($directory)) {
            $this->filesystem->remove($directory);
        }
    }

    /**
     * @param UploadedFile[] $files
     */
    private function validateFiles(array $files, MediaType $mediaType): void
    {
        if ($files === []) {
            throw new PostDraftFileInvalidException(FileInvalidReason::MissingFile);
        }

        match ($mediaType) {
            MediaType::Video => $this->validateVideo($files),
            MediaType::Image => $this->validateImage($files),
            MediaType::Carousel => $this->validateCarousel($files),
        };
    }

    /**
     * @param UploadedFile[] $files
     */
    private function validateVideo(array $files): void
    {
        if (count($files) !== 1) {
            throw new PostDraftFileInvalidException(FileInvalidReason::TooManyFiles);
        }

        $file = $files[0];

        if ($file->getSize() > self::MAX_VIDEO_SIZE) {
            throw new PostDraftFileInvalidException(FileInvalidReason::FileTooLarge);
        }

        if (!in_array($file->getMimeType(), self::ALLOWED_VIDEO_MIMES, true)) {
            throw new PostDraftFileInvalidException(FileInvalidReason::InvalidMimeType);
        }
    }

    /**
     * @param UploadedFile[] $files
     */
    private function validateImage(array $files): void
    {
        if (count($files) !== 1) {
            throw new PostDraftFileInvalidException(FileInvalidReason::TooManyFiles);
        }

        $this->assertImage($files[0]);
    }

    /**
     * @param UploadedFile[] $files
     */
    private function validateCarousel(array $files): void
    {
        if (count($files) < self::CAROUSEL_MIN_FILES) {
            throw new PostDraftFileInvalidException(FileInvalidReason::TooFewFiles);
        }

        if (count($files) > self::CAROUSEL_MAX_FILES) {
            throw new PostDraftFileInvalidException(FileInvalidReason::TooManyFiles);
        }

        foreach ($files as $file) {
            $this->assertImage($file);
        }
    }

    private function assertImage(UploadedFile $file): void
    {
        if ($file->getSize() > self::MAX_IMAGE_SIZE) {
            throw new PostDraftFileInvalidException(FileInvalidReason::FileTooLarge);
        }

        if (!in_array($file->getMimeType(), self::ALLOWED_IMAGE_MIMES, true)) {
            throw new PostDraftFileInvalidException(FileInvalidReason::InvalidMimeType);
        }
    }
}
