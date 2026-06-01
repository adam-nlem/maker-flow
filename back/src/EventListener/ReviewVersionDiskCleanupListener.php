<?php

namespace App\EventListener;

use App\Entity\ReviewVersion;
use App\Service\Review\ReviewFileService;
use Doctrine\ORM\Event\PreRemoveEventArgs;

final class ReviewVersionDiskCleanupListener
{
    public function __construct(
        private readonly ReviewFileService $reviewFileService,
    ) {}

    public function preRemove(ReviewVersion $reviewVersion, PreRemoveEventArgs $event): void
    {
        $this->reviewFileService->deleteReviewVersion($reviewVersion);
    }
}
