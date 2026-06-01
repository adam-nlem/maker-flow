<?php

namespace App\DTO\Response\Subscription;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class PlanConfigResponseDTO implements ResponseDTOInterface
{
    /**
     * @param string[] $features
     */
    public function __construct(
        #[Groups(['api_subscriptions_plans_list'])]
        private string $plan,
        #[Groups(['api_subscriptions_plans_list'])]
        private string $name,
        #[Groups(['api_subscriptions_plans_list'])]
        private float $monthlyPrice,
        #[Groups(['api_subscriptions_plans_list'])]
        private string $currency,
        #[Groups(['api_subscriptions_plans_list'])]
        private int $creditsPerMonth,
        #[Groups(['api_subscriptions_plans_list'])]
        private ?int $maxProjects,
        #[Groups(['api_subscriptions_plans_list'])]
        private ?int $maxScriptsPerProject,
        #[Groups(['api_subscriptions_plans_list'])]
        private ?int $maxEditorCollaborators,
        #[Groups(['api_subscriptions_plans_list'])]
        private ?int $maxVideoUploadHours,
        #[Groups(['api_subscriptions_plans_list'])]
        private ?int $maxStorageGb,
        /** @var string[] */
        #[Groups(['api_subscriptions_plans_list'])]
        private array $features,
        #[Groups(['api_subscriptions_plans_list'])]
        private bool $isHighlighted,
        #[Groups(['api_subscriptions_plans_list'])]
        private int $sortOrder,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            plan: $data['plan'],
            name: $data['name'],
            monthlyPrice: $data['monthlyPrice'],
            currency: $data['currency'],
            creditsPerMonth: $data['creditsPerMonth'],
            maxProjects: $data['maxProjects'],
            maxScriptsPerProject: $data['maxScriptsPerProject'],
            maxEditorCollaborators: $data['maxEditorCollaborators'] ?? null,
            maxVideoUploadHours: $data['maxVideoUploadHours'] ?? null,
            maxStorageGb: $data['maxStorageGb'] ?? null,
            features: $data['features'],
            isHighlighted: $data['isHighlighted'],
            sortOrder: $data['sortOrder'],
        );
    }

    public function getData(): array
    {
        return [
            'plan' => $this->getPlan(),
            'name' => $this->getName(),
            'monthlyPrice' => $this->getMonthlyPrice(),
            'currency' => $this->getCurrency(),
            'creditsPerMonth' => $this->getCreditsPerMonth(),
            'maxProjects' => $this->getMaxProjects(),
            'maxScriptsPerProject' => $this->getMaxScriptsPerProject(),
            'maxEditorCollaborators' => $this->getMaxEditorCollaborators(),
            'maxVideoUploadHours' => $this->getMaxVideoUploadHours(),
            'maxStorageGb' => $this->getMaxStorageGb(),
            'features' => $this->getFeatures(),
            'isHighlighted' => $this->isHighlighted(),
            'sortOrder' => $this->getSortOrder(),
        ];
    }

    public function getPlan(): string
    {
        return $this->plan;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getMonthlyPrice(): float
    {
        return $this->monthlyPrice;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function getCreditsPerMonth(): int
    {
        return $this->creditsPerMonth;
    }

    public function getMaxProjects(): ?int
    {
        return $this->maxProjects;
    }

    public function getMaxScriptsPerProject(): ?int
    {
        return $this->maxScriptsPerProject;
    }

    public function getMaxEditorCollaborators(): ?int
    {
        return $this->maxEditorCollaborators;
    }

    public function getMaxVideoUploadHours(): ?int
    {
        return $this->maxVideoUploadHours;
    }

    public function getMaxStorageGb(): ?int
    {
        return $this->maxStorageGb;
    }

    public function getFeatures(): array
    {
        return $this->features;
    }

    public function isHighlighted(): bool
    {
        return $this->isHighlighted;
    }

    public function getSortOrder(): int
    {
        return $this->sortOrder;
    }
}
