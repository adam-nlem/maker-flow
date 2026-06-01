<?php

namespace App\Service\Review;

use App\Entity\Enum\FileInvalidReason;
use App\Entity\Enum\MediaType;
use App\Entity\ReviewVersion;
use App\Exception\Review\ReviewFileInvalidException;
use App\Exception\Review\UnresolvableReviewVersionAgencyException;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ReviewFileService
{
    private const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
    private const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
    private const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/quicktime', 'video/webm'];
    private const ALLOWED_IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/webp'];
    private const CAROUSEL_MIN_FILES = 2;
    private const CAROUSEL_MAX_FILES = 10;
    private const COVER_FILENAME = 'cover.jpg';

    public function __construct(
        private readonly Filesystem $filesystem,
        private readonly string $agencyUploadsRoot,
    ) {}

    /**
     * @param UploadedFile[] $files
     */
    public function validateFiles(array $files, MediaType $mediaType): void
    {
        if ($files === []) {
            throw new ReviewFileInvalidException(FileInvalidReason::MissingFile);
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
    public function computeTotalSize(array $files): int
    {
        $total = 0;
        foreach ($files as $file) {
            $total += (int) $file->getSize();
        }

        return $total;
    }

    public function getReviewVersionDirectory(ReviewVersion $reviewVersion): string
    {
        $agencyUuid = $reviewVersion->getReview()?->getProject()?->getAgency()?->getUuid()
            ?? throw new UnresolvableReviewVersionAgencyException($reviewVersion->getUuid());

        return sprintf('%s/%s/reviews/%s', $this->agencyUploadsRoot, $agencyUuid, $reviewVersion->getUuid());
    }

    /**
     * @param UploadedFile[] $files
     */
    public function storeUploadedFiles(ReviewVersion $reviewVersion, array $files): void
    {
        $files = array_values($files);

        $directory = $this->getReviewVersionDirectory($reviewVersion);

        if (!$this->filesystem->exists($directory)) {
            $this->filesystem->mkdir($directory);
        }

        foreach ($files as $index => $file) {
            $extension = $file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'bin';
            $filename = sprintf('%d.%s', $index + 1, strtolower($extension));
            $file->move($directory, $filename);
        }
    }

    public function getFileByIndex(ReviewVersion $reviewVersion, int $index): ?File
    {
        $directory = $this->getReviewVersionDirectory($reviewVersion);

        if (!$this->filesystem->exists($directory)) {
            return null;
        }

        $matches = glob(sprintf('%s/%d.*', $directory, $index)) ?: [];

        if ($matches === []) {
            return null;
        }

        return new File($matches[0], false);
    }

    public function getCoverPath(ReviewVersion $reviewVersion): string
    {
        return sprintf('%s/%s', $this->getReviewVersionDirectory($reviewVersion), self::COVER_FILENAME);
    }

    public function getCoverFile(ReviewVersion $reviewVersion): ?File
    {
        $coverPath = $this->getCoverPath($reviewVersion);

        if (!is_file($coverPath)) {
            return null;
        }

        return new File($coverPath, false);
    }

    public function getStreamFile(ReviewVersion $reviewVersion, string $relativePath): ?File
    {
        $streamRoot = realpath(sprintf('%s/stream', $this->getReviewVersionDirectory($reviewVersion)));

        if ($streamRoot === false) {
            return null;
        }

        $candidate = realpath(sprintf('%s/%s', $streamRoot, $relativePath));

        if ($candidate === false || !str_starts_with($candidate, $streamRoot . DIRECTORY_SEPARATOR)) {
            return null;
        }

        if (!is_file($candidate)) {
            return null;
        }

        return new File($candidate, false);
    }

    public function deleteReviewVersion(ReviewVersion $reviewVersion): void
    {
        $directory = $this->getReviewVersionDirectory($reviewVersion);

        if ($this->filesystem->exists($directory)) {
            $this->filesystem->remove($directory);
        }
    }

    /**
     * @param UploadedFile[] $files
     */
    private function validateVideo(array $files): void
    {
        if (count($files) !== 1) {
            throw new ReviewFileInvalidException(FileInvalidReason::TooManyFiles);
        }

        $file = $files[0];

        if ($file->getSize() > self::MAX_VIDEO_SIZE) {
            throw new ReviewFileInvalidException(FileInvalidReason::FileTooLarge);
        }

        if (!in_array($file->getMimeType(), self::ALLOWED_VIDEO_MIMES, true)) {
            throw new ReviewFileInvalidException(FileInvalidReason::InvalidMimeType);
        }
    }

    /**
     * @param UploadedFile[] $files
     */
    private function validateImage(array $files): void
    {
        if (count($files) !== 1) {
            throw new ReviewFileInvalidException(FileInvalidReason::TooManyFiles);
        }

        $this->assertImage($files[0]);
    }

    /**
     * @param UploadedFile[] $files
     */
    private function validateCarousel(array $files): void
    {
        if (count($files) < self::CAROUSEL_MIN_FILES) {
            throw new ReviewFileInvalidException(FileInvalidReason::TooFewFiles);
        }

        if (count($files) > self::CAROUSEL_MAX_FILES) {
            throw new ReviewFileInvalidException(FileInvalidReason::TooManyFiles);
        }

        foreach ($files as $file) {
            $this->assertImage($file);
        }
    }

    private function assertImage(UploadedFile $file): void
    {
        if ($file->getSize() > self::MAX_IMAGE_SIZE) {
            throw new ReviewFileInvalidException(FileInvalidReason::FileTooLarge);
        }

        if (!in_array($file->getMimeType(), self::ALLOWED_IMAGE_MIMES, true)) {
            throw new ReviewFileInvalidException(FileInvalidReason::InvalidMimeType);
        }
    }
}
