<?php

namespace App\Entity;

use App\Entity\Enum\MediaType;
use App\Helper\DateHelper;
use App\Repository\ReviewRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: ReviewRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Review
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups(['api_reviews_list', 'api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups(['api_reviews_list', 'api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?string $description = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?string $notes = null;

    #[ORM\Column(length: 32, enumType: MediaType::class)]
    #[Groups(['api_reviews_list', 'api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?MediaType $mediaType = null;

    #[ORM\Column]
    #[Groups(['api_reviews_list', 'api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['api_reviews_list', 'api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'reviews')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Project $project = null;

    #[ORM\OneToOne(inversedBy: 'review')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL', unique: true)]
    #[Groups(['api_reviews_list', 'api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private ?Script $script = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $createdBy = null;

    /**
     * @var Collection<int, ReviewVersion>
     */
    #[ORM\OneToMany(targetEntity: ReviewVersion::class, mappedBy: 'review', cascade: ['remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['createdAt' => 'ASC'])]
    #[Groups(['api_reviews_show', 'api_review_versions_approve', 'api_review_versions_request_changes', 'api_review_comments_create'])]
    private Collection $versions;

    public function __construct()
    {
        if ($this->uuid === null) {
            $this->uuid = Uuid::v4();
        }

        if ($this->createdAt === null) {
            $this->createdAt = DateHelper::createUtcDateTimeImmutable();
        }

        if ($this->updatedAt === null) {
            $this->updatedAt = DateHelper::createUtcDateTimeImmutable();
        }

        $this->versions = new ArrayCollection();
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

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;

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

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;

        return $this;
    }

    public function getScript(): ?Script
    {
        return $this->script;
    }

    public function setScript(?Script $script): static
    {
        $this->script = $script;

        return $this;
    }

    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    public function setCreatedBy(?User $createdBy): static
    {
        $this->createdBy = $createdBy;

        return $this;
    }

    /**
     * @return Collection<int, ReviewVersion>
     */
    public function getVersions(): Collection
    {
        return $this->versions;
    }

    public function addVersion(ReviewVersion $version): static
    {
        if (!$this->versions->contains($version)) {
            $this->versions->add($version);
            $version->setReview($this);
        }

        return $this;
    }

    #[Groups(['api_reviews_list'])]
    public function getLatestVersion(): ?ReviewVersion
    {
        if ($this->versions->isEmpty()) {
            return null;
        }

        $sorted = $this->versions->toArray();
        usort($sorted, fn(ReviewVersion $a, ReviewVersion $b) => $b->getCreatedAt() <=> $a->getCreatedAt());

        return $sorted[0];
    }
}
