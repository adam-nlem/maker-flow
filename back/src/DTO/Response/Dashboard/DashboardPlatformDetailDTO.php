<?php

namespace App\DTO\Response\Dashboard;

use App\Entity\Enum\Platform;

class DashboardPlatformDetailDTO
{
    public function __construct(
        private readonly Platform $platform,
        private readonly string $integrationUuid,
        private readonly float $followers,
        private readonly float $views,
        private readonly ?float $engagementRate,
        private readonly float $reach,
    ) {}

    public function getData(): array
    {
        return [
            'platform' => $this->getPlatform()->value,
            'integrationUuid' => $this->getIntegrationUuid(),
            'followers' => $this->getFollowers(),
            'views' => $this->getViews(),
            'engagementRate' => $this->getEngagementRate(),
            'reach' => $this->getReach(),
        ];
    }

    public function getPlatform(): Platform
    {
        return $this->platform;
    }

    public function getIntegrationUuid(): string
    {
        return $this->integrationUuid;
    }

    public function getFollowers(): float
    {
        return $this->followers;
    }

    public function getViews(): float
    {
        return $this->views;
    }

    public function getEngagementRate(): ?float
    {
        return $this->engagementRate;
    }

    public function getReach(): float
    {
        return $this->reach;
    }
}
