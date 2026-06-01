<?php

namespace App\DTO;

final class ReviewUploadMetricsDTO
{
    public function __construct(
        private readonly int $fileSizeBytes,
        private readonly ?int $durationSeconds,
    ) {}

    public function getFileSizeBytes(): int
    {
        return $this->fileSizeBytes;
    }

    public function getDurationSeconds(): ?int
    {
        return $this->durationSeconds;
    }
}
