<?php

namespace App\DTO\Response\Dashboard;

use App\Entity\Enum\Platform;

class DashboardViewsTimelineDTO
{
    public function __construct(
        private readonly Platform $platform,
        /** @var DashboardViewsTimelinePointDTO[] */
        private readonly array $points,
    ) {}

    public function getData(): array
    {
        return [
            'platform' => $this->getPlatform()->value,
            'points' => array_map(
                fn(DashboardViewsTimelinePointDTO $p) => $p->getData(),
                $this->getPoints(),
            ),
        ];
    }

    public function getPlatform(): Platform
    {
        return $this->platform;
    }

    /**
     * @return DashboardViewsTimelinePointDTO[]
     */
    public function getPoints(): array
    {
        return $this->points;
    }
}
