<?php

namespace App\Entity;

use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Entity\Enum\InsightValueFormat;
use App\Entity\Enum\IntegrationInsightType;
use App\Repository\IntegrationInsightRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: IntegrationInsightRepository::class)]
#[ORM\HasLifecycleCallbacks]
class IntegrationInsight
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups([
        'api_integration_insights_list',
        'api_integration_insights_detail',
    ])]
    private ?string $uuid = null;

    #[ORM\Column]
    #[Groups([
        'api_integration_insights_list',
        'api_integration_insights_detail',
    ])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups([
        'api_integration_insights_list',
        'api_integration_insights_detail',
    ])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(enumType: IntegrationInsightType::class)]
    #[Groups([
        'api_integration_insights_list',
        'api_integration_insights_detail',
    ])]
    private ?IntegrationInsightType $type = null;

    #[ORM\Column(type: Types::FLOAT)]
    #[Groups([
        'api_integration_insights_list',
        'api_integration_insights_detail',
    ])]
    private ?float $value = null;

    #[ORM\Column(enumType: InsightValueFormat::class)]
    #[Groups([
        'api_integration_insights_list',
        'api_integration_insights_detail',
    ])]
    private ?InsightValueFormat $valueFormat = null;

    #[ORM\ManyToOne(targetEntity: Integration::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Integration $integration = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    public function __construct()
    {
        if (null === $this->uuid) {
            $this->uuid = Uuid::v4();
        }

        if (null === $this->createdAt) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = DateHelper::createUtcDateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUuid(): ?string
    {
        return $this->uuid;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function getType(): ?IntegrationInsightType
    {
        return $this->type;
    }

    public function setType(IntegrationInsightType $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getValue(): ?float
    {
        return $this->value;
    }

    public function setValue(float $value): static
    {
        $this->value = $value;
        return $this;
    }

    public function getValueFormat(): ?InsightValueFormat
    {
        return $this->valueFormat;
    }

    public function setValueFormat(InsightValueFormat $valueFormat): static
    {
        $this->valueFormat = $valueFormat;
        return $this;
    }

    public function getIntegration(): ?Integration
    {
        return $this->integration;
    }

    public function setIntegration(?Integration $integration): static
    {
        $this->integration = $integration;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }
}
