<?php

namespace App\DTO\Response\IntegrationInsight;

use App\Entity\Enum\Platform;

class IntegrationInsightsViewsTimelineDTO
{
    public function __construct(
        private readonly Platform $platform,
        /** @var IntegrationInsightsViewsTimelinePointDTO[] */
        private readonly array $points,
    ) {}

    public function getData(): array
    {
        return [
            'platform' => $this->getPlatform()->value,
            'points' => array_map(
                fn(IntegrationInsightsViewsTimelinePointDTO $p) => $p->getData(),
                $this->getPoints(),
            ),
        ];
    }

    public function getPlatform(): Platform
    {
        return $this->platform;
    }

    /**
     * @return IntegrationInsightsViewsTimelinePointDTO[]
     */
    public function getPoints(): array
    {
        return $this->points;
    }
}
