<?php

namespace App\DTO\Response\IntegrationInsight;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class ShowIntegrationDetailResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_integration_insights_detail'])]
        private readonly float $totalFollowers,
        #[Groups(['api_integration_insights_detail'])]
        private readonly int $postCount,
        #[Groups(['api_integration_insights_detail'])]
        private readonly int $streak,
        /** @var IntegrationInsightWithEvolutionDTO[] */
        #[Groups(['api_integration_insights_detail'])]
        private readonly array $insights,
        /** @var IntegrationInsightTimelineDTO[] */
        #[Groups(['api_integration_insights_detail'])]
        private readonly array $timelines,
        #[Groups(['api_integration_insights_detail'])]
        private readonly ?bool $isYoutubeReportPending = null,

    ) {}

    public function getData(): array
    {
        return [
            'totalFollowers' => $this->totalFollowers,
            'postCount' => $this->postCount,
            'streak' => $this->streak,
            'insights' => $this->insights,
            'timelines' => $this->timelines,
            'isYoutubeReportPending' => $this->isYoutubeReportPending,
        ];
    }

    /**
     * @return IntegrationInsightTimelineDTO[]
     */
    public function getTimelines(): array
    {
        return $this->timelines;
    }

    public function getTotalFollowers(): float
    {
        return $this->totalFollowers;
    }

    public function getPostCount(): int
    {
        return $this->postCount;
    }

    public function getStreak(): int
    {
        return $this->streak;
    }

    public function getInsights(): array
    {
        return $this->insights;
    }

    public function getIsYoutubeReportPending(): ?bool
    {
        return $this->isYoutubeReportPending;
    }
}
