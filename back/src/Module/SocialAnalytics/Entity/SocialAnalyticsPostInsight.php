<?php

namespace App\Module\SocialAnalytics\Entity;

use App\Entity\User;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: SocialAnalyticsPostInsightRepository::class)]
#[ORM\HasLifecycleCallbacks]
class SocialAnalyticsPostInsight
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups(['api_modules_social_analytics_posts_list', 'api_modules_social_analytics_post_insights_detail'])]
    private ?string $uuid = null;

    #[ORM\Column]
    #[Groups(['api_modules_social_analytics_posts_list', 'api_modules_social_analytics_post_insights_detail'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['api_modules_social_analytics_posts_list', 'api_modules_social_analytics_post_insights_detail'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(enumType: SocialAnalyticsPostInsightType::class)]
    #[Groups(['api_modules_social_analytics_posts_list', 'api_modules_social_analytics_post_insights_detail'])]
    private ?SocialAnalyticsPostInsightType $type = null;

    #[ORM\Column]
    #[Groups(['api_modules_social_analytics_posts_list', 'api_modules_social_analytics_post_insights_detail'])]
    private ?int $value = null;

    #[ORM\ManyToOne(targetEntity: SocialAnalyticsPost::class, inversedBy: 'postInsights')]
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

    public function getValue(): ?int
    {
        return $this->value;
    }

    public function setValue(int $value): static
    {
        $this->value = $value;
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
