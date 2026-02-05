<?php

namespace App\Module\SocialAnalytics\Entity;

use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsMediaType;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
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
    #[Groups(['api_modules_social_analytics_post_insights_detail'])]
    private ?string $uuid = null;

    #[ORM\Column]
    #[Groups(['api_modules_social_analytics_post_insights_detail'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['api_modules_social_analytics_post_insights_detail'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(length: 255)]
    #[Groups(['api_modules_social_analytics_post_insights_detail'])]
    private ?string $externalId = null;

    #[ORM\Column(length: 255, enumType: SocialAnalyticsMediaType::class)]
    #[Groups(['api_modules_social_analytics_post_insights_detail'])]
    private ?SocialAnalyticsMediaType $mediaType = null;

    #[ORM\Column]
    #[Groups(['api_modules_social_analytics_post_insights_detail'])]
    private ?int $duration = null;

    #[ORM\Column]
    #[Groups(['api_modules_social_analytics_post_insights_detail'])]
    private ?\DateTimeImmutable $publishedAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['api_modules_social_analytics_post_insights_detail'])]
    private ?string $caption = null;

    #[ORM\Column(length: 255)]
    #[Groups(['api_modules_social_analytics_post_insights_detail'])]
    private ?string $externalUrl = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Integration $integration = null;

    #[ORM\ManyToOne(inversedBy: 'posts')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?SocialAnalyticsPostGroup $socialAnalyticsPostGroup = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    /**
     * @var Collection<int, SocialAnalyticsPostInsight>
     */
    #[ORM\OneToMany(targetEntity: SocialAnalyticsPostInsight::class, mappedBy: 'socialAnalyticsPost', cascade: ['remove'], orphanRemoval: true)]
    private Collection $postInsights;

    public function __construct()
    {
        if (null === $this->uuid) {
            $this->uuid = Uuid::v4();
        }

        if (null === $this->createdAt) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        $this->postInsights = new ArrayCollection();
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

    public function getPublishedAt(): ?\DateTimeImmutable
    {
        return $this->publishedAt;
    }

    public function setPublishedAt(\DateTimeImmutable $publishedAt): static
    {
        $this->publishedAt = $publishedAt;

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

    public function getExternalUrl(): ?string
    {
        return $this->externalUrl;
    }

    public function setExternalUrl(string $externalUrl): static
    {
        $this->externalUrl = $externalUrl;
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

    public function getSocialAnalyticsPostGroup(): ?SocialAnalyticsPostGroup
    {
        return $this->socialAnalyticsPostGroup;
    }

    public function setSocialAnalyticsPostGroup(?SocialAnalyticsPostGroup $socialAnalyticsPostGroup): static
    {
        $this->socialAnalyticsPostGroup = $socialAnalyticsPostGroup;

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

    /**
     * @return Collection<int, SocialAnalyticsPostInsight>
     */
    public function getPostInsights(): Collection
    {
        return $this->postInsights;
    }

    public function addPostInsight(SocialAnalyticsPostInsight $postInsight): static
    {
        if (!$this->postInsights->contains($postInsight)) {
            $this->postInsights->add($postInsight);
            $postInsight->setSocialAnalyticsPost($this);
        }

        return $this;
    }

    public function removePostInsight(SocialAnalyticsPostInsight $postInsight): static
    {
        if ($this->postInsights->removeElement($postInsight)) {
            if ($postInsight->getSocialAnalyticsPost() === $this) {
                $postInsight->setSocialAnalyticsPost(null);
            }
        }

        return $this;
    }
}
