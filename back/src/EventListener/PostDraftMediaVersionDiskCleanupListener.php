<?php

namespace App\EventListener;

use App\Entity\PostDraftMediaVersion;
use App\Service\PostDraft\PostDraftFileService;
use Doctrine\ORM\Event\PreRemoveEventArgs;

final class PostDraftMediaVersionDiskCleanupListener
{
    public function __construct(
        private readonly PostDraftFileService $postDraftFileService,
    ) {}

    public function preRemove(PostDraftMediaVersion $mediaVersion, PreRemoveEventArgs $event): void
    {
        $this->postDraftFileService->deleteMediaVersion($mediaVersion);
    }
}
