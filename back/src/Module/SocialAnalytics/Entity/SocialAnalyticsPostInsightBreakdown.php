<?php

namespace App\Module\SocialAnalytics\Entity;

use App\Entity\User;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\Entity\Enum\InsightValueFormat;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use App\Module\SocialAnalytics\Entity\Enum\YoutubeLiveOrOnDemand;
use App\Module\SocialAnalytics\Entity\Enum\YoutubeSubscribedStatus;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightBreakdownRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: SocialAnalyticsPostInsightBreakdownRepository::class)]
#[ORM\HasLifecycleCallbacks]
class SocialAnalyticsPostInsightBreakdown
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

    #[ORM\Column(enumType: SocialAnalyticsPostInsightType::class)]
    private ?SocialAnalyticsPostInsightType $type = null;

    #[ORM\Column(type: Types::FLOAT)]
    private ?float $value = null;

    #[ORM\Column(enumType: InsightValueFormat::class)]
    private ?InsightValueFormat $valueFormat = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $date = null;

    #[ORM\Column(length: 2, nullable: true)]
    private ?string $countryCode = null;

    #[ORM\Column(enumType: YoutubeSubscribedStatus::class, nullable: true)]
    private ?YoutubeSubscribedStatus $subscribedStatus = null;

    #[ORM\Column(enumType: YoutubeLiveOrOnDemand::class, nullable: true)]
    private ?YoutubeLiveOrOnDemand $liveOrOnDemand = null;

    #[ORM\ManyToOne(targetEntity: SocialAnalyticsPost::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?SocialAnalyticsPost $socialAnalyticsPost = null;

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

    public function getType(): ?SocialAnalyticsPostInsightType
    {
        return $this->type;
    }

    public function setType(SocialAnalyticsPostInsightType $type): static
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

    public function getDate(): ?\DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(\DateTimeImmutable $date): static
    {
        $this->date = $date;
        return $this;
    }

    public function getCountryCode(): ?string
    {
        return $this->countryCode;
    }

    public function setCountryCode(?string $countryCode): static
    {
        $this->countryCode = $countryCode;
        return $this;
    }

    public function getSubscribedStatus(): ?YoutubeSubscribedStatus
    {
        return $this->subscribedStatus;
    }

    public function setSubscribedStatus(?YoutubeSubscribedStatus $subscribedStatus): static
    {
        $this->subscribedStatus = $subscribedStatus;
        return $this;
    }

    public function getLiveOrOnDemand(): ?YoutubeLiveOrOnDemand
    {
        return $this->liveOrOnDemand;
    }

    public function setLiveOrOnDemand(?YoutubeLiveOrOnDemand $liveOrOnDemand): static
    {
        $this->liveOrOnDemand = $liveOrOnDemand;
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
