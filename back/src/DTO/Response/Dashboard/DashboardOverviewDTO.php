<?php

namespace App\DTO\Response\Dashboard;

class DashboardOverviewDTO
{
    public function __construct(
        private readonly float $totalFollowers,
        private readonly ?string $totalFollowersEvolution,
        private readonly float $totalViews,
        private readonly ?string $totalViewsEvolution,
        private readonly ?float $engagementRate,
        private readonly ?string $engagementRateEvolution,
        private readonly float $totalReach,
        private readonly ?string $totalReachEvolution,
    ) {}

    public function getData(): array
    {
        return [
            'totalFollowers' => $this->getTotalFollowers(),
            'totalFollowersEvolution' => $this->getTotalFollowersEvolution(),
            'totalViews' => $this->getTotalViews(),
            'totalViewsEvolution' => $this->getTotalViewsEvolution(),
            'engagementRate' => $this->getEngagementRate(),
            'engagementRateEvolution' => $this->getEngagementRateEvolution(),
            'totalReach' => $this->getTotalReach(),
            'totalReachEvolution' => $this->getTotalReachEvolution(),
        ];
    }

    public function getTotalFollowers(): float
    {
        return $this->totalFollowers;
    }

    public function getTotalFollowersEvolution(): ?string
    {
        return $this->totalFollowersEvolution;
    }

    public function getTotalViews(): float
    {
        return $this->totalViews;
    }

    public function getTotalViewsEvolution(): ?string
    {
        return $this->totalViewsEvolution;
    }

    public function getEngagementRate(): ?float
    {
        return $this->engagementRate;
    }

    public function getEngagementRateEvolution(): ?string
    {
        return $this->engagementRateEvolution;
    }

    public function getTotalReach(): float
    {
        return $this->totalReach;
    }

    public function getTotalReachEvolution(): ?string
    {
        return $this->totalReachEvolution;
    }
}