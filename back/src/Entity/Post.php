<?php

namespace App\Entity;

use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Entity\Enum\MediaType;
use App\Repository\PostRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: PostRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Post
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups(['api_posts_list', 'api_posts_rank', 'api_post_insights_detail', 'api_post_groups_list', 'api_post_groups_rank'])]
    private ?string $uuid = null;

    #[ORM\Column]
    #[Groups(['api_post_insights_detail'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['api_post_insights_detail'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(length: 255)]
    #[Groups(['api_posts_list', 'api_posts_rank', 'api_post_insights_detail', 'api_post_groups_list', 'api_post_groups_rank'])]
    private ?string $externalId = null;

    #[ORM\Column(length: 255, enumType: MediaType::class)]
    #[Groups(['api_posts_list', 'api_posts_rank', 'api_post_insights_detail', 'api_post_groups_list', 'api_post_groups_rank'])]
    private ?MediaType $mediaType = null;

    #[ORM\Column]
    #[Groups(['api_posts_list', 'api_posts_rank', 'api_post_insights_detail', 'api_post_groups_list', 'api_post_groups_rank'])]
    private ?int $duration = null;

    #[ORM\Column]
    #[Groups(['api_posts_list', 'api_posts_rank', 'api_post_insights_detail', 'api_post_groups_list', 'api_post_groups_rank'])]
    private ?\DateTimeImmutable $publishedAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['api_posts_list', 'api_posts_rank', 'api_post_insights_detail', 'api_post_groups_list', 'api_post_groups_rank'])]
    private ?string $caption = null;

    #[ORM\Column(length: 255)]
    #[Groups(['api_posts_list', 'api_posts_rank', 'api_post_insights_detail', 'api_post_groups_list', 'api_post_groups_rank'])]
    private ?string $externalUrl = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Integration $integration = null;

    #[ORM\ManyToOne(inversedBy: 'posts')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?PostGroup $postGroup = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    /**
     * @var Collection<int, PostInsight>
     */
    #[ORM\OneToMany(targetEntity: PostInsight::class, mappedBy: 'post', cascade: ['remove'], orphanRemoval: true)]
    private Collection $postInsights;

    public function __construct()
    {
        if (null === $this->uuid) {
            $this->uuid = Uuid::v4();
        }

        if (null === $this->createdAt) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        if (null === $this->updatedAt) {
            $this->updatedAt = DateHelper::createUtcDateTimeImmutable();
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

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
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

    public function getMediaType(): ?MediaType
    {
        return $this->mediaType;
    }

    public function setMediaType(MediaType $mediaType): static
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

    public function getPostGroup(): ?PostGroup
    {
        return $this->postGroup;
    }

    public function setPostGroup(?PostGroup $postGroup): static
    {
        $this->postGroup = $postGroup;

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
     * @return Collection<int, PostInsight>
     */
    public function getPostInsights(): Collection
    {
        return $this->postInsights;
    }

    public function addPostInsight(PostInsight $postInsight): static
    {
        if (!$this->postInsights->contains($postInsight)) {
            $this->postInsights->add($postInsight);
            $postInsight->setPost($this);
        }

        return $this;
    }

    public function removePostInsight(PostInsight $postInsight): static
    {
        if ($this->postInsights->removeElement($postInsight)) {
            if ($postInsight->getPost() === $this) {
                $postInsight->setPost(null);
            }
        }

        return $this;
    }
}
