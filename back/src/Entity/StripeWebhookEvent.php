<?php

namespace App\Entity;

use App\Entity\Enum\StripeEventType;
use App\Helper\DateHelper;
use App\Repository\StripeWebhookEventRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: StripeWebhookEventRepository::class)]
class StripeWebhookEvent
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $stripeEventId = null;

    #[ORM\Column(enumType: StripeEventType::class)]
    private ?StripeEventType $eventType = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $processedAt = null;

    #[ORM\Column(type: Types::JSON)]
    private ?array $payload = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        if ($this->processedAt === null) {
            $this->processedAt = DateHelper::createUtcDateTimeImmutable();
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStripeEventId(): ?string
    {
        return $this->stripeEventId;
    }

    public function setStripeEventId(string $stripeEventId): static
    {
        $this->stripeEventId = $stripeEventId;

        return $this;
    }

    public function getEventType(): ?StripeEventType
    {
        return $this->eventType;
    }

    public function setEventType(StripeEventType $eventType): static
    {
        $this->eventType = $eventType;

        return $this;
    }

    public function getProcessedAt(): ?\DateTimeImmutable
    {
        return $this->processedAt;
    }

    public function setProcessedAt(\DateTimeImmutable $processedAt): static
    {
        $this->processedAt = $processedAt;

        return $this;
    }

    public function getPayload(): ?array
    {
        return $this->payload;
    }

    public function setPayload(array $payload): static
    {
        $this->payload = $payload;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
