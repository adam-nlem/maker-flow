<?php

namespace App\Module\SocialAnalytics\Entity;

use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsInsightType;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsInsightRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

#[ORM\Entity(repositoryClass: SocialAnalyticsInsightRepository::class)]
#[ORM\HasLifecycleCallbacks]
class SocialAnalyticsInsight
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    private ?string $uuid = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(enumType: SocialAnalyticsInsightType::class)]
    private ?SocialAnalyticsInsightType $type = null;

    #[ORM\Column]
    private ?int $value = null;

    #[ORM\ManyToOne(targetEntity: SocialAnalyticsPost::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?SocialAnalyticsPost $socialAnalyticsPost = null;

    #[ORM\ManyToOne(targetEntity: Integration::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
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

    #[Assert\Callback]
    public function validateOneRelationshipSet(ExecutionContextInterface $context): void
    {
        if (null === $this->socialAnalyticsPost && null === $this->integration) {
            $context->buildViolation('Either socialAnalyticsPost or integration must be set.')
                ->atPath('socialAnalyticsPost')
                ->addViolation();
        }
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

    public function getType(): ?SocialAnalyticsInsightType
    {
        return $this->type;
    }

    public function setType(SocialAnalyticsInsightType $type): self
    {
        $this->type = $type;
        return $this;
    }

    public function getValue(): ?int
    {
        return $this->value;
    }

    public function setValue(int $value): self
    {
        $this->value = $value;
        return $this;
    }

    public function getSocialAnalyticsPost(): ?SocialAnalyticsPost
    {
        return $this->socialAnalyticsPost;
    }

    public function setSocialAnalyticsPost(?SocialAnalyticsPost $socialAnalyticsPost): self
    {
        $this->socialAnalyticsPost = $socialAnalyticsPost;
        return $this;
    }

    public function getIntegration(): ?Integration
    {
        return $this->integration;
    }

    public function setIntegration(?Integration $integration): self
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
