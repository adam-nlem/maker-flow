<?php

namespace App\Module\SocialAnalytics\Entity;

use App\Helper\DateHelper;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostLogRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: SocialAnalyticsPostLogRepository::class)]
#[ORM\HasLifecycleCallbacks]
class SocialAnalyticsPostLog
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
    private ?int $viewsCount = null;

    #[ORM\Column]
    private ?int $likesCount = null;

    #[ORM\Column]
    private ?int $commentsCount = null;

    #[ORM\Column]
    private ?int $sharesCount = null;

    #[ORM\Column]
    private ?int $savesCount = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $richeData = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?SocialAnalyticsPost $socialAnalyticsPost = null;

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

    public function getViewsCount(): ?int
    {
        return $this->viewsCount;
    }

    public function setViewsCount(int $viewsCount): static
    {
        $this->viewsCount = $viewsCount;

        return $this;
    }

    public function getLikesCount(): ?int
    {
        return $this->likesCount;
    }

    public function setLikesCount(int $likesCount): static
    {
        $this->likesCount = $likesCount;

        return $this;
    }

    public function getCommentsCount(): ?int
    {
        return $this->commentsCount;
    }

    public function setCommentsCount(int $commentsCount): static
    {
        $this->commentsCount = $commentsCount;

        return $this;
    }

    public function getSharesCount(): ?int
    {
        return $this->sharesCount;
    }

    public function setSharesCount(int $sharesCount): static
    {
        $this->sharesCount = $sharesCount;

        return $this;
    }

    public function getSavesCount(): ?int
    {
        return $this->savesCount;
    }

    public function setSavesCount(int $savesCount): static
    {
        $this->savesCount = $savesCount;

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

    public function getSocialAnalyticsPost(): ?SocialAnalyticsPost
    {
        return $this->socialAnalyticsPost;
    }

    public function setSocialAnalyticsPost(?SocialAnalyticsPost $socialAnalyticsPost): static
    {
        $this->socialAnalyticsPost = $socialAnalyticsPost;

        return $this;
    }
}
