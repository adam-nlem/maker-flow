<?php

namespace App\EventListener;

use App\Entity\Integration;
use App\Service\Encryption\TokenEncryptionService;
use Doctrine\ORM\Event\PostLoadEventArgs;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Doctrine\ORM\Event\PostUpdateEventArgs;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;

final class IntegrationTokenEncryptionListener
{
    public function __construct(
        private readonly TokenEncryptionService $tokenEncryptionService,
    ) {}

    public function postLoad(Integration $integration, PostLoadEventArgs $event): void
    {
        $this->decryptTokens($integration);
    }

    public function prePersist(Integration $integration, PrePersistEventArgs $event): void
    {
        $this->encryptTokens($integration);
    }

    public function preUpdate(Integration $integration, PreUpdateEventArgs $event): void
    {
        $this->encryptTokens($integration);
    }

    public function postPersist(Integration $integration, PostPersistEventArgs $event): void
    {
        $this->decryptTokens($integration);
    }

    public function postUpdate(Integration $integration, PostUpdateEventArgs $event): void
    {
        $this->decryptTokens($integration);
    }

    private function encryptTokens(Integration $integration): void
    {
        if ($integration->getAccessToken() !== null) {
            $integration->setAccessToken(
                $this->tokenEncryptionService->encrypt($integration->getAccessToken())
            );
        }

        if ($integration->getRefreshToken() !== null) {
            $integration->setRefreshToken(
                $this->tokenEncryptionService->encrypt($integration->getRefreshToken())
            );
        }
    }

    private function decryptTokens(Integration $integration): void
    {
        if ($integration->getAccessToken() !== null) {
            $integration->setAccessToken(
                $this->tokenEncryptionService->decrypt($integration->getAccessToken())
            );
        }

        if ($integration->getRefreshToken() !== null) {
            $integration->setRefreshToken(
                $this->tokenEncryptionService->decrypt($integration->getRefreshToken())
            );
        }
    }
}
