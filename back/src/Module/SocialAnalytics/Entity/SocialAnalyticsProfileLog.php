<?php

namespace App\Module\SocialAnalytics\Entity;

use App\Helper\DateHelper;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsProfileLogRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: SocialAnalyticsProfileLogRepository::class)]
#[ORM\HasLifecycleCallbacks]
class SocialAnalyticsProfileLog
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

    #[ORM\Column]
    private ?int $followerCount = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $richeData = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?SocialAnalyticsProfile $socialAnalyticsProfile = null;

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

    public function getFollowerCount(): ?int
    {
        return $this->followerCount;
    }

    public function setFollowerCount(int $followerCount): static
    {
        $this->followerCount = $followerCount;

        return $this;
    }

    public function getRicheData(): ?array
    {
        return $this->richeData;
    }

    public function setRicheData(?array $richeData): static
    {
        $this->richeData = $richeData;

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
}
