<?php

namespace App\Entity;

use App\Entity\Enum\MediaType;
use App\Helper\DateHelper;
use App\Repository\PostDraftRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: PostDraftRepository::class)]
#[ORM\HasLifecycleCallbacks]
class PostDraft
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::GUID)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?string $uuid = null;

    #[ORM\Column(length: 255)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?string $description = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?string $notes = null;

    #[ORM\Column(length: 32, enumType: MediaType::class)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?MediaType $mediaType = null;

    #[ORM\Column]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'postDrafts')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Project $project = null;

    #[ORM\OneToOne(inversedBy: 'postDraft')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL', unique: true)]
    #[Groups(['api_post_drafts_list', 'api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private ?Script $script = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $createdBy = null;

    /**
     * @var Collection<int, PostDraftMediaVersion>
     */
    #[ORM\OneToMany(targetEntity: PostDraftMediaVersion::class, mappedBy: 'postDraft', cascade: ['remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['createdAt' => 'ASC'])]
    #[Groups(['api_post_drafts_show', 'api_post_draft_media_versions_approve', 'api_post_draft_media_versions_request_changes', 'api_post_draft_media_version_comments_create'])]
    private Collection $mediaVersions;

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

        $this->mediaVersions = new ArrayCollection();
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
     * @return Collection<int, PostDraftMediaVersion>
     */
    public function getMediaVersions(): Collection
    {
        return $this->mediaVersions;
    }

    public function addMediaVersion(PostDraftMediaVersion $mediaVersion): static
    {
        if (!$this->mediaVersions->contains($mediaVersion)) {
            $this->mediaVersions->add($mediaVersion);
            $mediaVersion->setPostDraft($this);
        }

        return $this;
    }

    #[Groups(['api_post_drafts_list'])]
    public function getLatestMediaVersion(): ?PostDraftMediaVersion
    {
        if ($this->mediaVersions->isEmpty()) {
            return null;
        }

        $sorted = $this->mediaVersions->toArray();
        usort($sorted, fn(PostDraftMediaVersion $a, PostDraftMediaVersion $b) => $b->getCreatedAt() <=> $a->getCreatedAt());

        return $sorted[0];
    }
}
