<?php

namespace App\Module\SocialAnalytics\Entity;

use App\Helper\DateHelper;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsMediaType;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: SocialAnalyticsPostRepository::class)]
#[ORM\HasLifecycleCallbacks]
class SocialAnalyticsPost
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

    #[ORM\Column(length: 255)]
    private ?string $externalId = null;

    #[ORM\Column(length: 255, enumType: SocialAnalyticsMediaType::class)]
    private ?SocialAnalyticsMediaType $mediaType = null;

    #[ORM\Column]
    private ?int $duration = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $caption = null;

    #[ORM\ManyToOne(inversedBy: 'posts')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?SocialAnalyticsProfile $socialAnalyticsProfile = null;

    #[ORM\ManyToOne(inversedBy: 'posts')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?SocialAnalyticsPostGroup $socialAnalyticsPostGroup = null;

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

    public function setUuid(string $uuid): static
    {
        $this->uuid = $uuid;

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

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getExternalId(): ?string
    {
        return $this->externalId;
    }

    public function setExternalId(string $externalId): static
    {
        $this->externalId = $externalId;

        return $this;
    }

    public function getMediaType(): ?SocialAnalyticsMediaType
    {
        return $this->mediaType;
    }

    public function setMediaType(SocialAnalyticsMediaType $mediaType): static
    {
        $this->mediaType = $mediaType;

        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    public function getCaption(): ?string
    {
        return $this->caption;
    }

    public function setCaption(?string $caption): static
    {
        $this->caption = $caption;

        return $this;
    }

    public function getSocialAnalyticsProfile(): ?SocialAnalyticsProfile
    {
        return $this->socialAnalyticsProfile;
    }

    public function setSocialAnalyticsProfile(?SocialAnalyticsProfile $socialAnalyticsProfile): static
    {
        $this->socialAnalyticsProfile = $socialAnalyticsProfile;

        return $this;
    }

    public function getSocialAnalyticsPostGroup(): ?SocialAnalyticsPostGroup
    {
        return $this->socialAnalyticsPostGroup;
    }

    public function setSocialAnalyticsPostGroup(?SocialAnalyticsPostGroup $socialAnalyticsPostGroup): static
    {
        $this->socialAnalyticsPostGroup = $socialAnalyticsPostGroup;

        return $this;
    }
}
